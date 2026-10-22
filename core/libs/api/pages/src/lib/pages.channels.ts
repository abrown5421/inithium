import { contentLockChannel, pagesChannel } from '@inithium/shared-contracts';
import { serveRealtimeChannel, type RealtimeChannelServer } from '@inithium/api-realtime';
import { lockIsLive, type ContentLock } from './content-lock.service';
import { findPageById } from './pages.service';

/** `core:pages`: anyone who can edit pages sees who's editing which, live (decision 0122). */
export const pagesChannelServer = serveRealtimeChannel(pagesChannel, { permission: 'pages.edit' });

/**
 * `core:content-lock/<pageId>/<lockId>`: only the builder session holding that lock, while it holds it, hears people
 * asking for the page (decision 0122).
 */
export const contentLockChannelServer = serveRealtimeChannel(contentLockChannel, {
  permission: 'pages.edit',
  canSubscribe: async (context, { pageId, lockId }) => {
    const page = await findPageById(pageId);
    const lock = (page?.contentLock ?? undefined) as ContentLock | undefined;
    return lockIsLive(lock) && lock.lockId === lockId && lock.userId === context.user?.id;
  },
});

/** The pages' realtime channels, for `startRealtime()`. */
export const pagesRealtimeChannels: RealtimeChannelServer[] = [pagesChannelServer, contentLockChannelServer];
