import type { z } from 'zod';
import { channelNameSchema, realtimeTypeSchema } from './realtime.schema';

/** A message clients may send on a channel: its payload, and what the api answers with, if anything. */
export type RealtimeMessageDefinition = { payload: z.ZodType; result?: z.ZodType };

/**
 * A realtime channel's contract (decision 0121), shared by the api, which serves and publishes on it, and the
 * frontends, which subscribe and send. It holds only data: who may subscribe and what messages do is the api's side
 * (`serveRealtimeChannel()` in `@inithium/api-realtime`).
 */
export type RealtimeChannelDefinition<
  Params extends string,
  Events extends Record<string, z.ZodType>,
  Messages extends Record<string, RealtimeMessageDefinition>,
  Meta extends z.ZodType,
> = {
  /** Who owns it: `core`, `plugin-<name>` or `client-<name>`. */
  namespace: string;
  /** What it's about, e.g. `pages` or `post`. */
  kind: string;
  /** The parameters after the kind, in order, e.g. `['postId']`; `[]` for none. */
  params: readonly Params[];
  /** What the api publishes on it: event type → payload schema. */
  events: Events;
  /** What subscribers may send on it, each handled by the api. Leave out for a channel that only listens. */
  messages?: Messages;
  /** Tracks who's subscribed, with each subscriber's `meta` (checked by the schema; leave it out for none). */
  presence?: { meta?: Meta };
};

/** A defined channel: its contract plus how to build and read its names. */
export type RealtimeChannel<
  Params extends string = string,
  Events extends Record<string, z.ZodType> = Record<string, z.ZodType>,
  Messages extends Record<string, RealtimeMessageDefinition> = Record<string, RealtimeMessageDefinition>,
  Meta extends z.ZodType = z.ZodType,
> = RealtimeChannelDefinition<Params, Events, Messages, Meta> & {
  /** `<namespace>:<kind>` then `:param` placeholders, e.g. `core:content-lock/:pageId/:lockId`. */
  pattern: string;
  /** The channel's name for these parameters (none for a channel without them). Throws if a value isn't allowed. */
  name(params?: Record<Params, string>): string;
  /** The parameters in a channel name, or undefined if the name isn't one of this channel's. */
  match(name: string): Record<Params, string> | undefined;
};

/** Any defined channel. */
export type AnyRealtimeChannel = RealtimeChannel;

/** A channel's parameters, by name. */
export type RealtimeParamsOf<C extends AnyRealtimeChannel> = C extends RealtimeChannel<infer P> ? Record<P, string> : never;

/** A channel's event types and their payloads. */
export type RealtimeEventsOf<C extends AnyRealtimeChannel> = { [K in keyof C['events'] & string]: z.infer<C['events'][K]> };

/** A channel's message types, each with its payload and result. */
export type RealtimeMessagesOf<C extends AnyRealtimeChannel> = {
  [K in keyof NonNullable<C['messages']> & string]: {
    payload: z.infer<NonNullable<C['messages']>[K]['payload']>;
    result: NonNullable<C['messages']>[K]['result'] extends z.ZodType ? z.infer<NonNullable<NonNullable<C['messages']>[K]['result']>> : void;
  };
};

/** A channel's presence metadata. */
export type RealtimePresenceMetaOf<C extends AnyRealtimeChannel> = z.infer<NonNullable<NonNullable<C['presence']>['meta']>>;

const NAMESPACE = /^(core|plugin-[a-z0-9-]+|client-[a-z0-9-]+)$/;
/** One parameter's value, as `channelNameSchema` allows it. */
const PARAM = /^[A-Za-z0-9_-]{1,64}$/;

/**
 * Defines a realtime channel's contract (decision 0121). Put it in a `scope:shared` lib (core's live in
 * `shared-contracts`, a plugin's in its `contracts` layer) so the api and the frontends share one definition.
 *
 * ```ts
 * export const postCommentsChannel = defineRealtimeChannel({
 *   namespace: 'plugin-blog',
 *   kind: 'post',
 *   params: ['postId'],
 *   events: { 'comment.created': commentSchema },
 * });
 * postCommentsChannel.name({ postId }); // 'plugin-blog:post/<postId>'
 * ```
 */
export function defineRealtimeChannel<
  const Params extends string,
  Events extends Record<string, z.ZodType>,
  Messages extends Record<string, RealtimeMessageDefinition> = Record<never, RealtimeMessageDefinition>,
  Meta extends z.ZodType = z.ZodType<undefined>,
>(definition: RealtimeChannelDefinition<Params, Events, Messages, Meta>): RealtimeChannel<Params, Events, Messages, Meta> {
  const prefix = `${definition.namespace}:${definition.kind}`;
  if (!NAMESPACE.test(definition.namespace)) throw new Error(`Realtime channel ${prefix}: the namespace must be core, plugin-<name> or client-<name>`);
  if (!channelNameSchema.safeParse(prefix).success) throw new Error(`Realtime channel ${prefix}: not a valid name`);
  for (const type of [...Object.keys(definition.events), ...Object.keys(definition.messages ?? {})]) {
    if (!realtimeTypeSchema.safeParse(type).success) throw new Error(`Realtime channel ${prefix}: '${type}' is not a valid event or message type`);
  }
  const { params } = definition;

  return {
    ...definition,
    pattern: [prefix, ...params.map((param) => `:${param}`)].join('/'),
    name(values) {
      const parts = params.map((param) => values?.[param] ?? '');
      const name = [prefix, ...parts].join('/');
      if (!parts.every((part) => PARAM.test(part))) throw new Error(`Realtime channel ${prefix}: '${name}' has a missing or invalid parameter`);
      return name;
    },
    match(name) {
      const [head, ...values] = name.split('/');
      if (head !== prefix || values.length !== params.length || !channelNameSchema.safeParse(name).success) return undefined;
      return Object.fromEntries(params.map((param, index) => [param, values[index]])) as Record<Params, string>;
    },
  };
}
