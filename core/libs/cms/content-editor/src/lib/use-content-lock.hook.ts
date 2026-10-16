import { useCallback, useEffect, useRef, useState } from 'react';
import { CONTENT_LOCK_HEARTBEAT_MS, pageEditingSchema, type PageEditing } from '@inithium/shared-contracts';
import { readApiFailure, useLockContentMutation, useUnlockContentMutation } from '@inithium/shared-data-access';

/** Where the builder's hold on a page stands. */
export type ContentLockState =
  /** Asking for the lock. */
  | { status: 'taking' }
  /** Holding it: the builder can save. */
  | { status: 'held' }
  /** Someone else had the page open when the builder asked. */
  | { status: 'blocked'; editing?: PageEditing }
  /** The builder held it, then someone else took it (after it went two minutes without a heartbeat). */
  | { status: 'lost'; editing?: PageEditing }
  /** Asking failed for another reason, e.g. the network. */
  | { status: 'failed' };

/** Who's editing, from a 409's body. */
const editingFrom = (error: unknown): PageEditing | undefined =>
  pageEditingSchema.safeParse((error as { data?: { editing?: unknown } } | undefined)?.data?.editing).data;

/**
 * Holds a page's edit lock for the page builder (decision 0116): takes it on opening, keeps it alive every
 * CONTENT_LOCK_HEARTBEAT_MS and lets go on leaving (with sendBeacon if the tab closes). `check()` asks again, e.g.
 * after a save is refused. Each builder session has its own lock id, so the same person in two tabs is refused too.
 */
export function useContentLock(pageId: string) {
  const [lockId] = useState(() => crypto.randomUUID());
  const [state, setState] = useState<ContentLockState>({ status: 'taking' });
  const [lock] = useLockContentMutation();
  const [unlock] = useUnlockContentMutation();
  const held = useRef(false);

  /** Records the answer to asking for the lock: held, or refused (and why). */
  const settle = useCallback((error?: unknown) => {
    if (error === undefined) {
      held.current = true;
      setState({ status: 'held' });
    } else if (readApiFailure(error).status === 409) {
      setState({ status: held.current ? 'lost' : 'blocked', editing: editingFrom(error) });
      held.current = false;
    } else if (!held.current) {
      // A heartbeat that fails for another reason keeps the lock: the next one may get through.
      setState({ status: 'failed' });
    }
  }, []);

  const check = useCallback(
    () =>
      lock({ id: pageId, lockId })
        .unwrap()
        .then(
          () => settle(),
          (error: unknown) => settle(error ?? new Error('Refused')),
        ),
    [lock, pageId, lockId, settle],
  );

  useEffect(() => {
    void check();
  }, [check]);

  useEffect(() => {
    if (state.status !== 'held') return;
    const timer = window.setInterval(() => void check(), CONTENT_LOCK_HEARTBEAT_MS);
    return () => window.clearInterval(timer);
  }, [state.status, check]);

  useEffect(() => {
    const release = () => {
      if (!held.current) return;
      navigator.sendBeacon(`/api/pages/${pageId}/content/unlock`, new Blob([JSON.stringify({ lockId })], { type: 'application/json' }));
    };
    window.addEventListener('pagehide', release);
    return () => {
      window.removeEventListener('pagehide', release);
      if (!held.current) return;
      held.current = false;
      void unlock({ id: pageId, lockId });
    };
  }, [pageId, lockId, unlock]);

  return { state, lockId, check };
}
