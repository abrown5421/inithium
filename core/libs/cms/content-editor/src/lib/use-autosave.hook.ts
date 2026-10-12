import { useCallback, useEffect, useRef, useState } from 'react';
import type { ContentDocument } from '@inithium/shared-contracts';

/** How long after the last change the draft saves, in ms. */
const DELAY = 1200;

/** Where the draft stands: saved, waiting to save, saving, failed, or blocked by problems in its blocks. */
export type SaveStatus = 'saved' | 'pending' | 'saving' | 'error' | 'invalid';

export type AutosaveOptions = {
  doc: ContentDocument;
  /** Whether the draft passes its contract; an invalid draft isn't saved. */
  valid: boolean;
  /** Saves the draft; rejects on failure. */
  save: (doc: ContentDocument) => Promise<unknown>;
};

/**
 * Autosaves the editor's draft (decision 0093): a moment after the last change, only when it's valid and differs
 * from what was last saved. `flush()` saves now (e.g. before publishing) and resolves whether everything is saved;
 * `markSaved()` records a draft the server already has (e.g. after discarding).
 */
export function useAutosave({ doc, valid, save }: AutosaveOptions) {
  const json = JSON.stringify(doc);
  const [savedJson, setSavedJson] = useState(json);
  const [request, setRequest] = useState<'idle' | 'saving' | 'error'>('idle');

  // The latest values, for saves that run after a delay or when the editor closes.
  const latest = useRef({ doc, json, valid, save, savedJson });
  useEffect(() => {
    latest.current = { doc, json, valid, save, savedJson };
  });
  const inFlight = useRef<Promise<boolean> | null>(null);

  const run = useCallback(async (): Promise<boolean> => {
    // Wait for a save already under way, then save again only if there's still something new.
    if (inFlight.current) await inFlight.current;
    const { doc: current, json: currentJson, valid: ok, save: send, savedJson: stored } = latest.current;
    if (currentJson === stored) return true;
    if (!ok) return false;
    setRequest('saving');
    const attempt = send(current).then(
      () => {
        latest.current = { ...latest.current, savedJson: currentJson };
        setSavedJson(currentJson);
        setRequest('idle');
        return true;
      },
      () => {
        setRequest('error');
        return false;
      },
    );
    inFlight.current = attempt;
    const result = await attempt;
    inFlight.current = null;
    return result;
  }, []);

  // Each change restarts the countdown.
  useEffect(() => {
    if (json === savedJson || !valid) return;
    const timer = window.setTimeout(() => void run(), DELAY);
    return () => window.clearTimeout(timer);
  }, [json, savedJson, valid, run]);

  // Warn before leaving the page with unsaved changes, and save what's pending when the editor closes.
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (latest.current.json !== latest.current.savedJson) event.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => {
      window.removeEventListener('beforeunload', warn);
      void run();
    };
  }, [run]);

  const markSaved = useCallback((next: ContentDocument) => {
    const nextJson = JSON.stringify(next);
    latest.current = { ...latest.current, savedJson: nextJson };
    setSavedJson(nextJson);
    setRequest('idle');
  }, []);

  const dirty = json !== savedJson;
  const status: SaveStatus =
    request === 'saving' ? 'saving' : !dirty ? 'saved' : !valid ? 'invalid' : request === 'error' ? 'error' : 'pending';
  return { status, dirty, flush: run, markSaved };
}
