import type { IncomingMessage, Server as HttpServer } from 'node:http';
import { Server, type Socket } from 'socket.io';
import {
  REALTIME_LIMITS,
  REALTIME_PATH,
  REALTIME_WIRE,
  realtimeActivitySchema,
  realtimeSendSchema,
  realtimeSubscribeSchema,
  realtimeUnsubscribeSchema,
  type AnyRealtimeChannel,
  type PresenceActivity,
  type RealtimeAck,
  type RealtimeEventsOf,
  type RealtimeParamsOf,
  type RealtimePresence,
} from '@inithium/shared-contracts';
import { hasPermission } from '@inithium/shared-permissions';
import { onSessionsRevoked, readAuthFromCookieHeader } from '@inithium/api-auth';
import { createMemoryBroker, type RealtimeBroker } from './realtime-broker.service';
import { checkRealtimeChannels, RealtimeError, type RealtimeChannelServer, type RealtimeContext } from './realtime-channels.service';
import { PresenceStore, type PresenceChange } from './realtime-presence.service';

/*
 * The realtime server (decision 0121): Socket.IO on the api's own HTTP server at REALTIME_PATH. A connection is a
 * signed-in user or a guest, decided once from the access cookie at the handshake; it ends when that session expires
 * or is revoked, and the client refreshes and reconnects. Subscriptions are checked by each channel's server side;
 * events are published by api code only and travel through the broker.
 */

type Running = { io: Server; servers: readonly RealtimeChannelServer[]; presence: PresenceStore; stop: (() => void)[] };

let broker: RealtimeBroker = createMemoryBroker();
let running: Running | undefined;

/** Per connection: who it is, what it's subscribed to, its rate limit and activity. */
type Connection = { context: RealtimeContext; channels: Set<string>; tokens: number; refilledAt: number; activity: PresenceActivity };
const connections = new WeakMap<Socket, Connection>();
/** Each signed-in user's open connections, oldest first. */
const byUser = new Map<string, Socket[]>();

/** A signed-in user's activity across all their connections: active if any is, idle if all are, offline with none. */
export type UserActivity = 'active' | 'idle' | 'offline';
const activityListeners = new Set<(userId: string, activity: UserActivity) => void>();

/** A user's activity now, from their open connections on this instance (decision 0124). */
export function userActivity(userId: string): UserActivity {
  const sockets = byUser.get(userId) ?? [];
  if (!sockets.length) return 'offline';
  return sockets.some((socket) => connections.get(socket)?.activity === 'active') ? 'active' : 'idle';
}

/**
 * Calls the listener whenever a signed-in user's activity changes: they connect, go idle or active, or close their
 * last connection (decision 0124). Returns a function that stops it.
 */
export function onUserActivity(listener: (userId: string, activity: UserActivity) => void): () => void {
  activityListeners.add(listener);
  return () => activityListeners.delete(listener);
}

/** Runs a change to a user's connections and tells the listeners if their activity changed. */
function trackActivity(userId: string, change: () => void): void {
  const before = userActivity(userId);
  change();
  const after = userActivity(userId);
  if (after !== before) for (const listener of activityListeners) listener(userId, after);
}

/**
 * Publishes an event on a channel to everyone subscribed, on every instance (decision 0121). Only api code
 * publishes; the payload is checked against the channel's schema, and a mismatch throws.
 *
 * ```ts
 * publishRealtime(pagesChannel, {}, 'editing.changed', { pageId, editing: null });
 * ```
 */
export function publishRealtime<C extends AnyRealtimeChannel, T extends keyof RealtimeEventsOf<C> & string>(
  channel: C,
  params: RealtimeParamsOf<C>,
  type: T,
  payload: RealtimeEventsOf<C>[T],
): void {
  const schema = channel.events[type];
  if (!schema) throw new Error(`Realtime channel ${channel.pattern} has no event '${type}'`);
  broker.publish({ channel: channel.name(params), type, payload: schema.parse(payload) });
}

/**
 * Starts the realtime server on the api's HTTP server with the channels it serves (core's and the registry's).
 * Call once, before listening. `broker` defaults to the in-memory one.
 */
export function startRealtime(httpServer: HttpServer, options: { channels: readonly RealtimeChannelServer[]; broker?: RealtimeBroker }): void {
  if (running) throw new Error('The realtime server is already running');
  checkRealtimeChannels(options.channels);
  if (options.broker) broker = options.broker;

  const io = new Server(httpServer, {
    path: REALTIME_PATH,
    serveClient: false,
    maxHttpBufferSize: REALTIME_LIMITS.maxMessageBytes,
    // Same origin only: the connection carries the session cookie, so another site mustn't open one.
    allowRequest: (req, callback) => callback(null, sameOrigin(req)),
  });
  const presence = new PresenceStore();
  running = { io, servers: options.channels, presence, stop: [] };
  const state = running;

  io.on('connection', (socket) => connect(state, socket));
  state.stop.push(
    broker.subscribe((message) => io.to(message.channel).emit(REALTIME_WIRE.event, message)),
    // Signed out everywhere (a role change, password reset or deletion): their connections end at once.
    onSessionsRevoked((userIds) => {
      for (const id of userIds) for (const socket of byUser.get(id) ?? []) endSession(socket);
    }),
  );
}

/** Stops the realtime server: closes every connection and, with it, the HTTP server it was started on. */
export async function stopRealtime(): Promise<void> {
  const state = running;
  if (!state) return;
  running = undefined;
  for (const stop of state.stop) stop();
  for (const userId of [...byUser.keys()]) trackActivity(userId, () => byUser.delete(userId));
  broker = createMemoryBroker();
  await new Promise<void>((resolve) => void state.io.close(() => resolve()));
}

/** Whether a handshake comes from this site's own pages (requests without an Origin aren't from a browser page). */
function sameOrigin(req: IncomingMessage): boolean {
  const { origin, host } = req.headers;
  if (!origin) return true;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/** Tells the client its session ended or expired, so it refreshes and reconnects, and closes the connection. */
function endSession(socket: Socket): void {
  socket.emit(REALTIME_WIRE.reauth);
  socket.disconnect(true);
}

function connect(state: Running, socket: Socket): void {
  const auth = readAuthFromCookieHeader(socket.request.headers.cookie);
  // A session that must change its password first is treated as a guest (decision 0088).
  const user = auth && !auth.pcr ? { id: auth.sub, role: auth.role } : undefined;
  const connection: Connection = {
    context: { connectionId: socket.id, ...(user ? { user } : {}) },
    channels: new Set(),
    tokens: REALTIME_LIMITS.messagesPerSecond * 3,
    refilledAt: Date.now(),
    // The browser says in its handshake whether the person is active or idle (a reconnect keeps what it was).
    activity: realtimeActivitySchema.safeParse(socket.handshake.auth).data?.activity ?? 'active',
  };
  connections.set(socket, connection);

  let expiry: NodeJS.Timeout | undefined;
  if (user) {
    const sockets = [...(byUser.get(user.id) ?? []), socket];
    trackActivity(user.id, () => byUser.set(user.id, sockets));
    // Over the limit: the oldest connection makes way.
    if (sockets.length > REALTIME_LIMITS.maxConnectionsPerUser) sockets[0]?.disconnect(true);
    if (auth?.exp) expiry = setTimeout(() => endSession(socket), Math.max(0, auth.exp * 1000 - Date.now()));
  }

  const handle =
    (work: (raw: unknown) => Promise<RealtimeAck>) =>
    (raw: unknown, ack?: unknown): void => {
      const reply = typeof ack === 'function' ? (ack as (answer: RealtimeAck) => void) : () => undefined;
      if (!takeToken(connection)) return reply(refused('LIMITED', 'Too many messages; slow down'));
      work(raw).then(reply, (error: unknown) => reply(failure(error)));
    };

  socket.on(REALTIME_WIRE.subscribe, handle((raw) => subscribe(state, socket, connection, raw)));
  socket.on(REALTIME_WIRE.unsubscribe, handle(async (raw) => {
    const parsed = realtimeUnsubscribeSchema.safeParse(raw);
    if (!parsed.success) return refused('INVALID', 'Not a channel name');
    leave(state, socket, connection, parsed.data.channel);
    return { ok: true };
  }));
  socket.on(REALTIME_WIRE.send, handle((raw) => send(state, connection, raw)));
  socket.on(REALTIME_WIRE.activity, (raw: unknown) => {
    const parsed = realtimeActivitySchema.safeParse(raw);
    if (!parsed.success || !takeToken(connection)) return;
    const activity = parsed.data.activity;
    if (user) trackActivity(user.id, () => (connection.activity = activity));
    else connection.activity = activity;
    for (const { channel, change } of state.presence.setActivity(socket.id, parsed.data.activity)) {
      state.io.to(channel).emit(REALTIME_WIRE.presence, presenceMessage(channel, change));
    }
  });
  socket.on('disconnect', () => {
    clearTimeout(expiry);
    for (const channel of [...connection.channels]) leave(state, socket, connection, channel);
    if (user) {
      const rest = (byUser.get(user.id) ?? []).filter((other) => other !== socket);
      trackActivity(user.id, () => (rest.length ? byUser.set(user.id, rest) : byUser.delete(user.id)));
    }
  });
}

const refused = (code: Exclude<RealtimeAck, { ok: true }>['code'], message: string): RealtimeAck => ({ ok: false, code, message });

/** A handler's failure as the client sees it: its own reason for a RealtimeError, nothing internal otherwise. */
function failure(error: unknown): RealtimeAck {
  if (error instanceof RealtimeError) return refused(error.code, error.message);
  console.error('[ realtime ]', error);
  return refused('FAILED', 'Something went wrong');
}

/** A token bucket: messagesPerSecond on average, bursts up to three seconds' worth. */
function takeToken(connection: Connection): boolean {
  const now = Date.now();
  const rate = REALTIME_LIMITS.messagesPerSecond;
  connection.tokens = Math.min(rate * 3, connection.tokens + ((now - connection.refilledAt) / 1000) * rate);
  connection.refilledAt = now;
  if (connection.tokens < 1) return false;
  connection.tokens -= 1;
  return true;
}

/** The served channel a name belongs to, with its parameters. */
function find(state: Running, name: string): { server: RealtimeChannelServer; params: Record<string, string> } | undefined {
  for (const server of state.servers) {
    const params = server.channel.match(name);
    if (params) return { server, params };
  }
  return undefined;
}

async function subscribe(state: Running, socket: Socket, connection: Connection, raw: unknown): Promise<RealtimeAck> {
  const parsed = realtimeSubscribeSchema.safeParse(raw);
  if (!parsed.success) return refused('INVALID', 'Not a channel name');
  const { channel: name } = parsed.data;
  if (connection.channels.has(name)) return { ok: true };
  if (connection.channels.size >= REALTIME_LIMITS.maxSubscriptions) return refused('LIMITED', 'Subscribed to too many channels');

  const found = find(state, name);
  if (!found) return refused('NOT_FOUND', 'No such channel');
  const { server, params } = found;
  const { context } = connection;
  const allowed =
    (context.user ? true : Boolean(server.guests)) &&
    (!server.permission || (context.user !== undefined && hasPermission(context.user.role, server.permission))) &&
    (!server.canSubscribe || (await server.canSubscribe(context, params)));
  if (!allowed) return refused('FORBIDDEN', 'You can’t subscribe to this channel');

  const tracked = server.channel.presence;
  let meta: unknown;
  if (tracked) {
    if (server.presenceMeta) meta = await server.presenceMeta(context, params, parsed.data.meta);
    else if (tracked.meta) {
      const checked = tracked.meta.safeParse(parsed.data.meta);
      if (!checked.success) return refused('INVALID', 'Presence details don’t match the channel');
      meta = checked.data;
    }
  }
  // It may have closed, or subscribed twice at once, while the checks ran.
  if (!socket.connected || connection.channels.has(name)) return { ok: true };

  connection.channels.add(name);
  await socket.join(name);
  if (tracked) {
    const change = state.presence.join(name, socket.id, { userId: context.user?.id, activity: connection.activity, meta });
    socket.emit(REALTIME_WIRE.presence, { channel: name, kind: 'sync', members: state.presence.members(name) } satisfies RealtimePresence);
    if (change) socket.to(name).emit(REALTIME_WIRE.presence, presenceMessage(name, change));
  }
  for (const event of (await server.snapshot?.(context, params)) ?? []) {
    const schema = server.channel.events[event.type];
    if (schema) socket.emit(REALTIME_WIRE.event, { channel: name, type: event.type, payload: schema.parse(event.payload) });
  }
  return { ok: true };
}

function leave(state: Running, socket: Socket, connection: Connection, name: string): void {
  if (!connection.channels.delete(name)) return;
  void socket.leave(name);
  const change = state.presence.leave(name, socket.id);
  if (change) state.io.to(name).emit(REALTIME_WIRE.presence, presenceMessage(name, change));
}

async function send(state: Running, connection: Connection, raw: unknown): Promise<RealtimeAck> {
  const parsed = realtimeSendSchema.safeParse(raw);
  if (!parsed.success) return refused('INVALID', 'Not a message');
  const { channel: name, type } = parsed.data;
  // Sending needs a subscription, so a channel's subscribe check covers its messages too.
  if (!connection.channels.has(name)) return refused('FORBIDDEN', 'Subscribe to the channel first');
  const found = find(state, name);
  const definition = found?.server.channel.messages?.[type];
  const handler = (found?.server.messages as Record<string, (payload: unknown, context: RealtimeContext, params: Record<string, string>) => unknown> | undefined)?.[type];
  if (!found || !definition || !handler) return refused('NOT_FOUND', 'No such message on this channel');

  const payload = definition.payload.safeParse(parsed.data.payload);
  if (!payload.success) return refused('INVALID', 'The message doesn’t match the channel');
  const result = await handler(payload.data, connection.context, found.params);
  return { ok: true, ...(definition.result ? { result: definition.result.parse(result) } : {}) };
}

const presenceMessage = (channel: string, change: PresenceChange): RealtimePresence => ({ channel, ...change });
