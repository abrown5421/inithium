import { useCallback, useEffect, useLayoutEffect, useSyncExternalStore } from 'react';
import type { ColorScheme } from '@inithium/shared-contracts';
import {
  applyColorScheme,
  prefersDark,
  readStoredColorScheme,
  readStoredDarkMode,
  resolveColorScheme,
  storeColorScheme,
  storeDarkMode,
  subscribeToStoredColorScheme,
  subscribeToSystemColorScheme,
  type ResolvedColorScheme,
} from './color-scheme.service';

export type ColorSchemeOptions = {
  /** Whether the site allows dark mode (site settings' `darkMode`). Leave it out until known to use the stored answer. */
  enabled?: boolean;
  /**
   * The signed-in user's preference. It wins and is stored, so it stays after signing out until the next user signs in.
   * Leave it out while signed out.
   */
  account?: ColorScheme;
  /** The preference when nothing is stored: `system` for the apps, `light` for the docs app. */
  fallback?: ColorScheme;
};

export type ColorSchemeState = {
  /** The preference in force: the account's, or this browser's. */
  preference: ColorScheme;
  /** The scheme being drawn. */
  resolved: ResolvedColorScheme;
  /** Whether dark mode is allowed at all. */
  enabled: boolean;
  /** Stores a preference for this browser (the account's own is saved through the api). */
  setPreference: (scheme: ColorScheme) => void;
};

/**
 * Keeps the page in the right colour scheme (decision 0119): the account's preference when signed in, otherwise the
 * one stored in this browser, resolved against the device for `system` and forced light while the site has dark mode
 * off. Use it once per app, at its root (other components read the result); index.html's `colorSchemeScript()` has
 * already applied the same answer before the first paint.
 */
export function useColorScheme({ enabled: siteEnabled, account, fallback = 'system' }: ColorSchemeOptions = {}): ColorSchemeState {
  const stored = useSyncExternalStore(subscribeToStoredColorScheme, readStoredColorScheme);
  const systemDark = useSyncExternalStore(subscribeToSystemColorScheme, prefersDark);
  const enabled = siteEnabled ?? readStoredDarkMode() ?? true;
  const preference = account ?? stored ?? fallback;
  const resolved = resolveColorScheme(preference, { enabled, systemDark });

  // Signing in (or the account changing its preference) replaces this browser's choice.
  useEffect(() => {
    if (account) storeColorScheme(account);
  }, [account]);
  useEffect(() => {
    if (siteEnabled !== undefined) storeDarkMode(siteEnabled);
  }, [siteEnabled]);
  // Before paint, so a change never shows a frame in the old scheme.
  useLayoutEffect(() => applyColorScheme(resolved), [resolved]);

  const setPreference = useCallback((scheme: ColorScheme) => storeColorScheme(scheme), []);
  return { preference, resolved, enabled, setPreference };
}

// The scheme on screen is whatever <html> says, so any component can follow it without owning it.
function subscribeToAppliedColorScheme(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
}

const readAppliedColorScheme = (): ResolvedColorScheme =>
  document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';

/**
 * The scheme on screen, for components that draw something different in dark mode (e.g. the logo) without owning the
 * choice: it follows whatever `useColorScheme()` (or index.html's script) applied.
 */
export function useAppliedColorScheme(): ResolvedColorScheme {
  return useSyncExternalStore(subscribeToAppliedColorScheme, readAppliedColorScheme, () => 'light');
}
