import { useCallback, useEffect, useEffectEvent, useState } from 'react';
import { useDispatch } from 'react-redux';
import type {
  AnyRealtimeChannel,
  PresenceMember,
  RealtimeEventsOf,
  RealtimeMessagesOf,
  RealtimeParamsOf,
  RealtimePresenceMetaOf,
} from '@inithium/shared-contracts';
import { baseApi } from '@inithium/shared-data-access';
import type { SubscriptionState } from './realtime-connection.service';
import { useRealtimeConnection } from './realtime-provider.component';

/** An RTK Query cache tag, e.g. `'Page'` or `{ type: 'Page', id: 'LIST' }`. */
export type RealtimeInvalidatedTag = string | { type: string; id?: string | number };

export type UseChannelOptions<C extends AnyRealtimeChannel> = {
  /** Handlers for the channel's events, by type; each payload is checked against the channel's schema first. */
  events?: { [K in keyof RealtimeEventsOf<C>]?: (payload: RealtimeEventsOf<C>[K]) => void };
  /**
   * RTK Query tags to invalidate on every event and after resubscribing (when events may have been missed): the
   * one-line way to keep cached data live.
   */
  invalidates?: readonly RealtimeInvalidatedTag[];
  /** Called after resubscribing when the connection came back: refetch anything events would have changed. */
  onResubscribed?: () => void;
  /** The channel's presence, whenever it changes (where the channel tracks it). */
  onPresence?: (members: PresenceMember[]) => void;
  /** Presence metadata for this subscriber; the first subscriber's wins when several share a channel. */
  meta?: RealtimePresenceMetaOf<C>;
};

/**
 * Subscribes to a channel while the component is mounted (decision 0121); `params` null holds off (e.g. until the
 * data the name needs has loaded). Returns the subscription's state and `send()` for the channel's messages, which
 * resolves with the api's result or rejects with a `RealtimeRequestError`.
 *
 * ```tsx
 * useChannel(pagesChannel, {}, { events: { 'editing.changed': (change) => setPageEditing(dispatch, change) } });
 * ```
 */
export function useChannel<C extends AnyRealtimeChannel>(channel: C, params: RealtimeParamsOf<C> | null, options: UseChannelOptions<C> = {}) {
  const connection = useRealtimeConnection();
  const dispatch = useDispatch();
  const [state, setState] = useState<SubscriptionState>({ status: 'subscribing' });
  const name = params ? channel.name(params) : null;

  // Effect events read the latest options, so passing new handlers each render doesn't resubscribe.
  const invalidate = useEffectEvent(() => {
    const tags = options.invalidates;
    // Feature apis add their tag types to baseApi at runtime (enhanceEndpoints), which its own type can't see.
    if (tags?.length) dispatch(baseApi.util.invalidateTags(tags as never));
  });
  const onEvent = useEffectEvent((type: string, payload: unknown) => {
    const parsed = channel.events[type]?.safeParse(payload);
    if (!parsed?.success) return void console.warn(`[ realtime ] ignored a malformed '${type}' event on ${name}`);
    const handler = options.events?.[type as keyof RealtimeEventsOf<C>];
    handler?.(parsed.data as RealtimeEventsOf<C>[keyof RealtimeEventsOf<C>]);
    invalidate();
  });
  const onPresence = useEffectEvent((members: PresenceMember[]) => options.onPresence?.(members));
  const onResubscribed = useEffectEvent(() => {
    options.onResubscribed?.();
    invalidate();
  });
  const currentMeta = useEffectEvent(() => options.meta);

  useEffect(() => {
    if (!name) return undefined;
    return connection.subscribe(name, { onState: setState, onEvent, onPresence, onResubscribed }, currentMeta());
  }, [connection, name]);

  const send = useCallback(
    async <K extends keyof RealtimeMessagesOf<C> & string>(type: K, payload: RealtimeMessagesOf<C>[K]['payload']): Promise<RealtimeMessagesOf<C>[K]['result']> => {
      if (!name) throw new Error('useChannel(): not subscribed yet');
      return (await connection.send(name, type, payload)) as RealtimeMessagesOf<C>[K]['result'];
    },
    [connection, name],
  );

  return { state, send };
}
