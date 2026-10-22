import { z } from 'zod';

/*
 * The realtime layer's wire protocol (decision 0121): one Socket.IO connection per browser tab at REALTIME_PATH, on
 * the api's own origin and cookies. Clients subscribe to channels, receive the events the api publishes on them,
 * send the messages a channel declares, and see who else is subscribed (presence) where a channel tracks it.
 */

/** Where the realtime connection is served (Socket.IO's `path`). */
export const REALTIME_PATH = '/api/realtime';

/** What one connection may do; a channel can't raise them. */
export const REALTIME_LIMITS = {
  /** The largest message a client may send, in bytes. */
  maxMessageBytes: 32 * 1024,
  /** Messages a connection may send per second (subscribing and sending alike), averaged over a few seconds. */
  messagesPerSecond: 20,
  /** Channels one connection may be subscribed to at once. */
  maxSubscriptions: 100,
  /** Connections one account may hold at once (tabs and devices); the oldest is closed for a new one. */
  maxConnectionsPerUser: 10,
} as const;

/**
 * After this long without input a connection reports itself idle (decision 0124: a user shows as inactive). A hidden
 * tab gets no input, so it goes idle on the same timer.
 */
export const REALTIME_IDLE_AFTER_MS = 10 * 60 * 1000;

/** The Socket.IO event names the client and the api use. */
export const REALTIME_WIRE = {
  /** Client → api: subscribe to a channel (acknowledged). */
  subscribe: 'subscribe',
  /** Client → api: unsubscribe (acknowledged). */
  unsubscribe: 'unsubscribe',
  /** Client → api: a message a channel declares (acknowledged with its result). */
  send: 'send',
  /** Client → api: whether the person is active or idle. */
  activity: 'activity',
  /** Api → client: an event published on a subscribed channel. */
  event: 'event',
  /** Api → client: a change in a subscribed channel's presence. */
  presence: 'presence',
  /** Api → client: the session behind the connection ended or expired; refresh it and reconnect. */
  reauth: 'reauth',
} as const;

/**
 * A channel's name: `<namespace>:<kind>`, then its parameters after slashes, e.g. `core:pages` or
 * `plugin-blog:post/652f1c…`. Namespaces are `core`, `plugin-<name>` or `client-<name>`.
 */
export const channelNameSchema = z
  .string()
  .max(200)
  .regex(/^[a-z][a-z0-9-]*:[a-z][a-z0-9-]*(\/[A-Za-z0-9_-]{1,64})*$/, { error: 'Not a channel name' });

/** An event or message type, e.g. `editing.changed`. */
export const realtimeTypeSchema = z.string().regex(/^[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*)*$/, { error: 'Not an event type' }).max(64);

/** Whether a person is using the page now or has stepped away. */
export const presenceActivitySchema = z.enum(['active', 'idle']);

/** Client → api: `subscribe`. `meta` is the subscriber's presence metadata, where the channel takes any. */
export const realtimeSubscribeSchema = z.object({ channel: channelNameSchema, meta: z.unknown().optional() }).strict();

/** Client → api: `unsubscribe`. */
export const realtimeUnsubscribeSchema = z.object({ channel: channelNameSchema }).strict();

/** Client → api: `send`. */
export const realtimeSendSchema = z.object({ channel: channelNameSchema, type: realtimeTypeSchema, payload: z.unknown() }).strict();

/** Client → api: `activity`. */
export const realtimeActivitySchema = z.object({ activity: presenceActivitySchema }).strict();

/** Why the api refused a subscription or message. */
export const realtimeErrorCodeSchema = z.enum([
  /** The request was malformed, or its payload didn't match the channel's schema. */
  'INVALID',
  /** No channel by that name, or no such message on it. */
  'NOT_FOUND',
  /** The connection's user (or guest) may not do this. */
  'FORBIDDEN',
  /** Too many messages or subscriptions. */
  'LIMITED',
  /** The channel's handler failed. */
  'FAILED',
]);

/** The api's answer to `subscribe`, `unsubscribe` and `send`. */
export const realtimeAckSchema = z.discriminatedUnion('ok', [
  z.object({ ok: z.literal(true), result: z.unknown().optional() }).strict(),
  z.object({ ok: z.literal(false), code: realtimeErrorCodeSchema, message: z.string() }).strict(),
]);

/** Api → client: `event`. */
export const realtimeEventSchema = z.object({ channel: channelNameSchema, type: realtimeTypeSchema, payload: z.unknown() }).strict();

/**
 * One subscriber in a channel's presence. A signed-in user's tabs and devices count once (`key` is their user id),
 * active if any of them is; each guest connection counts on its own.
 */
export const presenceMemberSchema = z
  .object({
    key: z.string(),
    userId: z.string().optional(),
    guest: z.boolean(),
    activity: presenceActivitySchema,
    meta: z.unknown().optional(),
  })
  .strict();

/** Api → client: `presence`. `sync` is the whole list (on subscribing); the rest are changes to it. */
export const realtimePresenceSchema = z.discriminatedUnion('kind', [
  z.object({ channel: channelNameSchema, kind: z.literal('sync'), members: z.array(presenceMemberSchema) }).strict(),
  z.object({ channel: channelNameSchema, kind: z.literal('join'), member: presenceMemberSchema }).strict(),
  z.object({ channel: channelNameSchema, kind: z.literal('update'), member: presenceMemberSchema }).strict(),
  z.object({ channel: channelNameSchema, kind: z.literal('leave'), key: z.string() }).strict(),
]);
