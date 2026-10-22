import { useState } from 'react';
import { presenceLight, userStatusChannel, type SolidColorValue, type UserStatus } from '@inithium/shared-contracts';
import { useChannel } from './use-channel.hook';

/**
 * A user's status light, live (decision 0124): `{ color, label }` for Avatar's `presence`, or undefined until it's
 * known (or with no `userId`). Follows `core:user-status/<userId>`, which sends the status at once and then each change.
 */
export function useUserPresence(userId: string | undefined): { color: SolidColorValue; label: string } | undefined {
  const [current, setCurrent] = useState<{ userId: string; status: UserStatus }>();
  useChannel(userStatusChannel, userId ? { userId } : null, {
    events: { 'status.changed': (status) => userId && setCurrent({ userId, status }) },
  });
  // A status received for an earlier user isn't shown for this one.
  return current && current.userId === userId ? presenceLight(current.status) : undefined;
}
