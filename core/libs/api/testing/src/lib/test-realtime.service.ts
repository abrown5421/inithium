import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import type { Express } from 'express';
import { io, type Socket } from 'socket.io-client';
import {
  REALTIME_PATH,
  REALTIME_WIRE,
  type PresenceActivity,
  type RealtimeAck,
  type RealtimeEvent,
  type RealtimePresence,
} from '@inithium/shared-contracts';
import type { TestClient } from './test-client.service';

/** A test app listening on a free port, for things that need a server that stays up, e.g. realtime connections. */
export type TestServer = { server: Server; url: string; close: () => Promise<void> };

/**
 * Starts the app listening on a free local port. Pass `server` to `startRealtime()`, then connect with
 * `connectTestRealtime()`; `close()` when done (after `stopRealtime()`, which closes the server itself).
 */
export async function listenTestApi(app: Express): Promise<TestServer> {
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>((resolve) => server.once('listening', resolve));
  const { port } = server.address() as AddressInfo;
  return {
    server,
    url: `http://127.0.0.1:${port}`,
    close: () => new Promise<void>((resolve) => (server.listening ? server.close(() => resolve()) : resolve())),
  };
}

/** A realtime connection as tests drive it: everything it received, kept in order, and calls that wait for answers. */
export type TestRealtimeClient = {
  socket: Socket;
  /** Every event received. */
  events: RealtimeEvent[];
  /** Every presence message received. */
  presence: RealtimePresence[];
  /** How many times the api said the session ended. */
  reauths: number;
  subscribe(channel: string, meta?: unknown): Promise<RealtimeAck>;
  unsubscribe(channel: string): Promise<RealtimeAck>;
  send(channel: string, type: string, payload?: unknown): Promise<RealtimeAck>;
  activity(activity: PresenceActivity): void;
  /** The next event (already received or still to come) matching the test, or a failure after `timeoutMs`. */
  nextEvent(match?: (event: RealtimeEvent) => boolean, timeoutMs?: number): Promise<RealtimeEvent>;
  /** The next presence message matching the test. */
  nextPresence(match?: (message: RealtimePresence) => boolean, timeoutMs?: number): Promise<RealtimePresence>;
  /** Resolves once the api has closed the connection. */
  disconnected(timeoutMs?: number): Promise<void>;
  close(): void;
};

/**
 * Opens a realtime connection to a test server, signed in as `client` (its cookies) or as a guest without one. Fails
 * if the api refuses the connection. `headers` adds to the handshake's, e.g. an `origin`; `auth` is the handshake's
 * `auth` payload, e.g. `{ activity: 'idle' }` as a browser reconnecting while idle sends.
 *
 * ```ts
 * const realtime = await connectTestRealtime(server, client);
 * expect(await realtime.subscribe('core:pages')).toEqual({ ok: true });
 * ```
 */
export async function connectTestRealtime(
  server: TestServer,
  client?: TestClient,
  headers: Record<string, string> = {},
  auth?: Record<string, unknown>,
): Promise<TestRealtimeClient> {
  const cookie = client?.cookieHeader();
  const socket = io(server.url, {
    path: REALTIME_PATH,
    transports: ['websocket'],
    reconnection: false,
    extraHeaders: { ...headers, ...(cookie ? { cookie } : {}) },
    ...(auth ? { auth } : {}),
  });
  await new Promise<void>((resolve, reject) => {
    socket.once('connect', () => resolve());
    socket.once('connect_error', (error) => reject(error));
  });

  const events: RealtimeEvent[] = [];
  const presence: RealtimePresence[] = [];
  const waiters = new Set<() => void>();
  const notify = () => {
    for (const waiter of [...waiters]) waiter();
  };
  const realtime: TestRealtimeClient = {
    socket,
    events,
    presence,
    reauths: 0,
    subscribe: (channel, meta) => socket.emitWithAck(REALTIME_WIRE.subscribe, meta === undefined ? { channel } : { channel, meta }),
    unsubscribe: (channel) => socket.emitWithAck(REALTIME_WIRE.unsubscribe, { channel }),
    send: (channel, type, payload) => socket.emitWithAck(REALTIME_WIRE.send, { channel, type, payload }),
    activity: (activity) => void socket.emit(REALTIME_WIRE.activity, { activity }),
    nextEvent: (match = () => true, timeoutMs = 2000) => waitFor(events, match, timeoutMs, 'event'),
    nextPresence: (match = () => true, timeoutMs = 2000) => waitFor(presence, match, timeoutMs, 'presence message'),
    disconnected: (timeoutMs = 2000) =>
      socket.disconnected ? Promise.resolve() : waitUntil(() => socket.disconnected, timeoutMs, 'the connection to close').then(() => undefined),
    close: () => void socket.close(),
  };
  socket.on(REALTIME_WIRE.event, (event: RealtimeEvent) => {
    events.push(event);
    notify();
  });
  socket.on(REALTIME_WIRE.presence, (message: RealtimePresence) => {
    presence.push(message);
    notify();
  });
  socket.on(REALTIME_WIRE.reauth, () => {
    realtime.reauths += 1;
  });
  socket.on('disconnect', notify);

  // Each wait claims what it matched, so two waits for the same kind of message get one each.
  const claimed = new WeakSet<object>();
  function waitFor<T extends object>(list: T[], match: (item: T) => boolean, timeoutMs: number, what: string): Promise<T> {
    const find = () => list.find((item) => !claimed.has(item) && match(item));
    return waitUntil(find, timeoutMs, `a matching ${what}`).then((item) => {
      claimed.add(item);
      return item;
    });
  }
  function waitUntil<T>(check: () => T | undefined | false, timeoutMs: number, what: string): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const done = check();
      if (done) return resolve(done);
      const timer = setTimeout(() => {
        waiters.delete(waiter);
        reject(new Error(`Timed out waiting for ${what}`));
      }, timeoutMs);
      const waiter = () => {
        const found = check();
        if (!found) return;
        clearTimeout(timer);
        waiters.delete(waiter);
        resolve(found);
      };
      waiters.add(waiter);
    });
  }
  return realtime;
}
