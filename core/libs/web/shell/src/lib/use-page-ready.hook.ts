import { useContext, useLayoutEffect } from 'react';
import { PageReadyContext } from './page-ready.context';

/**
 * Holds a page's entrance until its data is ready (decision 0079): call it with false while loading and true once
 * everything has arrived. The shell shows a Loader meanwhile. Pages that don't call it are ready at once.
 */
export function usePageReady(ready: boolean): void {
  const context = useContext(PageReadyContext);
  // A layout effect runs before the shell's own, and before paint, so the page never flashes in unready.
  useLayoutEffect(() => {
    context?.claim();
    context?.report(ready);
  }, [context, ready]);
}
