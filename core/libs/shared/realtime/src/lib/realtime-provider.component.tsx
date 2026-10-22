import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useDispatch } from 'react-redux';
import { baseApi, refreshSession, useGetCurrentUserQuery } from '@inithium/shared-data-access';
import { RealtimeConnection } from './realtime-connection.service';

const RealtimeContext = createContext<RealtimeConnection | null>(null);

/**
 * Gives the app its one realtime connection (decision 0121). Render it once inside the store's Provider, around
 * everything that subscribes. The connection opens on the first subscription, or at once for a signed-in user (so
 * they show as present, decision 0124), and reopens when the signed-in user changes, so the api always sees the
 * current session.
 */
export function RealtimeProvider({ children }: { children: ReactNode }) {
  const dispatch = useDispatch();
  const [connection] = useState(
    () =>
      new RealtimeConnection({
        refreshSession: async () => {
          const signedIn = await refreshSession();
          // Fetch who we are again: the session may have ended, or the role changed.
          dispatch(baseApi.util.invalidateTags(['CurrentUser']));
          return signedIn;
        },
      }),
  );

  const { data: user } = useGetCurrentUserQuery();
  const session = user ? `${user.id}:${user.role}:${user.passwordChangeRequired}` : 'guest';
  const previous = useRef(session);
  useEffect(() => {
    if (previous.current === session) return;
    previous.current = session;
    connection.reconnect();
  }, [connection, session]);

  // Signed in, the connection stays open so the api counts the user as present (decision 0124).
  const signedIn = Boolean(user && !user.passwordChangeRequired);
  useEffect(() => connection.setKeepOpen(signedIn), [connection, signedIn]);

  useEffect(() => () => connection.close(), [connection]);

  return <RealtimeContext.Provider value={connection}>{children}</RealtimeContext.Provider>;
}

/** The app's realtime connection, from `RealtimeProvider`. */
export function useRealtimeConnection(): RealtimeConnection {
  const connection = useContext(RealtimeContext);
  if (!connection) throw new Error('useRealtimeConnection() needs a <RealtimeProvider> above it');
  return connection;
}
