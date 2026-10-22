import { contentLockChannel } from '@inithium/shared-contracts';
import { useAlerts } from '@inithium/shared-data-access';
import { useChannel } from '@inithium/shared-realtime';

/**
 * While the page builder holds a page's edit lock, shows an alert whenever someone asks for the page (decision
 * 0122). The alert stays until dismissed; what to do about it is the editor's call, and nothing is sent back.
 */
export function useEditRequests(pageId: string, lockId: string, held: boolean): void {
  const { show } = useAlerts();
  useChannel(contentLockChannel, held ? { pageId, lockId } : null, {
    events: {
      'edit.requested': ({ from }) =>
        show({
          icon: 'hand',
          title: `${from.name} would like to edit this page`,
          message: 'When you’re ready to hand it over, let your changes finish saving and leave the page builder. Or keep working: they can open it once you’ve finished.',
          duration: null,
        }),
    },
  });
}
