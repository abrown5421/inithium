import { defineRealtimeChannel } from '../realtime/realtime-channels.service';
import { pageEditingChangedSchema, pageEditRequestSchema } from './pages.schema';

/**
 * `core:pages` (decisions 0121, 0122): changes to the page list everyone with pages.edit sees live, e.g. who has a page
 * open in the page builder.
 */
export const pagesChannel = defineRealtimeChannel({
  namespace: 'core',
  kind: 'pages',
  params: [],
  events: { 'editing.changed': pageEditingChangedSchema },
});

/**
 * `core:content-lock/<pageId>/<lockId>` (decision 0122): the one page builder session holding a page's edit lock.
 * Only that session's user may subscribe, and only while the lock is theirs; someone asking for the page reaches
 * it here.
 */
export const contentLockChannel = defineRealtimeChannel({
  namespace: 'core',
  kind: 'content-lock',
  params: ['pageId', 'lockId'],
  events: { 'edit.requested': pageEditRequestSchema },
});
