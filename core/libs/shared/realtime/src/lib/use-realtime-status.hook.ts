import { useSyncExternalStore } from 'react';
import type { RealtimeStatus } from './realtime-connection.service';
import { useRealtimeConnection } from './realtime-provider.component';

/** The realtime connection's status, e.g. to show that live updates are paused while offline. */
export function useRealtimeStatus(): RealtimeStatus {
  const connection = useRealtimeConnection();
  return useSyncExternalStore(connection.onStatusChange, () => connection.status);
}
