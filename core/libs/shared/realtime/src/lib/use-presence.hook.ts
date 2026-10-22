import { useState } from 'react';
import type { AnyRealtimeChannel, PresenceMember, RealtimeParamsOf, RealtimePresenceMetaOf } from '@inithium/shared-contracts';
import { useChannel } from './use-channel.hook';

/** Who's subscribed to a channel that tracks presence, kept current (decision 0121). */
export function usePresence<C extends AnyRealtimeChannel>(channel: C, params: RealtimeParamsOf<C> | null, meta?: RealtimePresenceMetaOf<C>): PresenceMember[] {
  const [members, setMembers] = useState<PresenceMember[]>([]);
  useChannel(channel, params, { onPresence: setMembers, meta });
  return members;
}
