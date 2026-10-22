import type {
  AnyRealtimeChannel,
  RealtimeEventsOf,
  Permission,
  RealtimeErrorCode,
  RealtimeMessagesOf,
  RealtimeParamsOf,
  RealtimePresenceMetaOf,
  Role,
} from '@inithium/shared-contracts';

/** Who's on the other end of a realtime connection. Sessions that must change their password count as guests. */
export type RealtimeContext = {
  /** This connection's id: one per browser tab. */
  connectionId: string;
  /** The signed-in user, or undefined for a guest. */
  user?: { id: string; role: Role };
};

type Awaitable<T> = T | Promise<T>;

/**
 * Handles each message a channel declares: checks and acts on it, and returns its result. (Each handler is declared
 * as a method so a list of servers for different channels type-checks as `RealtimeChannelServer[]`.)
 */
export type RealtimeMessageHandlers<C extends AnyRealtimeChannel> = {
  [K in keyof RealtimeMessagesOf<C>]: {
    handle(payload: RealtimeMessagesOf<C>[K]['payload'], context: RealtimeContext, params: RealtimeParamsOf<C>): Awaitable<RealtimeMessagesOf<C>[K]['result']>;
  }['handle'];
};

/** One of a channel's events, with its payload. */
export type RealtimeEventOf<C extends AnyRealtimeChannel> = {
  [K in keyof RealtimeEventsOf<C>]: { type: K; payload: RealtimeEventsOf<C>[K] };
}[keyof RealtimeEventsOf<C>];

/** The api's side of a channel (decision 0121): who may subscribe, and what its messages do. */
export type RealtimeChannelServer<C extends AnyRealtimeChannel = AnyRealtimeChannel> = {
  channel: C;
  /** Whether guests (no session) may subscribe. Default false. */
  guests?: boolean;
  /** A permission the subscriber's role must hold (implies signed in). */
  permission?: Permission;
  /** Any further check, run after `guests` and `permission`; return false to refuse. */
  canSubscribe?(context: RealtimeContext, params: RealtimeParamsOf<C>): Awaitable<boolean>;
  /**
   * The subscriber's presence metadata, decided by the api (e.g. a display name it looks up), replacing whatever
   * the client sent. Without it the client's `meta` is used, checked by the channel's schema.
   */
  presenceMeta?(context: RealtimeContext, params: RealtimeParamsOf<C>, requested: RealtimePresenceMetaOf<C> | undefined): Awaitable<RealtimePresenceMetaOf<C>>;
  /**
   * Events sent only to a new subscriber, straight after subscribing: the state now, so it doesn't wait for the next
   * change (decision 0124), e.g. a user's current status.
   */
  snapshot?(context: RealtimeContext, params: RealtimeParamsOf<C>): Awaitable<RealtimeEventOf<C>[]>;
} & (string extends keyof RealtimeMessagesOf<C>
  ? // Any channel (e.g. a list of servers): handlers may or may not be there.
    { messages?: RealtimeMessageHandlers<C> }
  : [keyof RealtimeMessagesOf<C>] extends [never]
    ? { messages?: undefined }
    : // A channel that declares messages must handle every one.
      { messages: RealtimeMessageHandlers<C> });

/**
 * Serves a channel's contract on the api (decision 0121). Core passes its own to `startRealtime()`; plugins and
 * libs/client add theirs to the api registry's `registeredRealtimeChannels`.
 *
 * ```ts
 * export const postCommentsServer = serveRealtimeChannel(postCommentsChannel, {
 *   guests: true,
 *   canSubscribe: async (_context, { postId }) => Boolean(await PostModel.exists({ _id: postId, published: true })),
 * });
 * ```
 */
export function serveRealtimeChannel<C extends AnyRealtimeChannel>(channel: C, options: Omit<RealtimeChannelServer<C>, 'channel'>): RealtimeChannelServer<C> {
  return { channel, ...options } as RealtimeChannelServer<C>;
}

/** Refuses a subscription or message on purpose, with a reason the client sees (anything else thrown is FAILED). */
export class RealtimeError extends Error {
  constructor(
    readonly code: Exclude<RealtimeErrorCode, 'FAILED'>,
    message: string,
  ) {
    super(message);
    this.name = 'RealtimeError';
  }
}

/** Checks no two served channels share a pattern; throws naming the clash. */
export function checkRealtimeChannels(servers: readonly RealtimeChannelServer[]): void {
  const seen = new Set<string>();
  for (const { channel } of servers) {
    const prefix = `${channel.namespace}:${channel.kind}`;
    if (seen.has(prefix)) throw new Error(`Two realtime channels are both ${prefix}`);
    seen.add(prefix);
  }
}
