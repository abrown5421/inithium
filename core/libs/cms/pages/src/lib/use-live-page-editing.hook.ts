import { useDispatch } from 'react-redux';
import { pagesChannel, type PageEditingChanged } from '@inithium/shared-contracts';
import { pagesApi, setPageEditing, type AppDispatch } from '@inithium/shared-data-access';
import { useChannel } from '@inithium/shared-realtime';

/**
 * Keeps who's editing each page current in the cached pages while mounted (decision 0122), from `pagesChannel`, and
 * tells `onChange` too. After the connection drops and comes back, the pages are fetched again, since changes may
 * have been missed. Needs pages.edit.
 */
export function useLivePageEditing(onChange?: (change: PageEditingChanged) => void, enabled = true): void {
  const dispatch = useDispatch<AppDispatch>();
  useChannel(pagesChannel, enabled ? {} : null, {
    events: {
      'editing.changed': (change) => {
        setPageEditing(dispatch, change);
        onChange?.(change);
      },
    },
    onResubscribed: () => dispatch(pagesApi.util.invalidateTags(['Page'])),
  });
}
