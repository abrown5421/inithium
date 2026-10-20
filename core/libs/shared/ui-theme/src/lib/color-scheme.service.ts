import type { ColorScheme } from '@inithium/shared-contracts';

/** The colour scheme as drawn: a `system` preference resolves to one of these. */
export type ResolvedColorScheme = 'light' | 'dark';

/**
 * Where the browser keeps the last colour scheme (decision 0119): the signed-in user's preference, kept after signing
 * out until the next user signs in. Only clearing the browser's storage resets it.
 */
export const COLOR_SCHEME_STORAGE_KEY = 'inithium-color-scheme';

/** Where the browser keeps whether the site allows dark mode, for the first paint of the Vite dev servers. */
export const DARK_MODE_STORAGE_KEY = 'inithium-dark-mode';

/** Fired on window whenever this tab stores a new colour scheme, so every reader follows it. */
const CHANGE_EVENT = 'inithium-color-scheme-change';

const DARK_QUERY = '(prefers-color-scheme: dark)';

const isColorScheme = (value: unknown): value is ColorScheme => value === 'system' || value === 'light' || value === 'dark';

// Storage can be missing or refuse access (e.g. some private windows); the colour scheme then lives for the page only.
function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Not stored: the choice still applies until the page closes.
  }
}

/** The colour scheme stored in this browser, if any. */
export function readStoredColorScheme(): ColorScheme | undefined {
  const stored = readStorage(COLOR_SCHEME_STORAGE_KEY);
  return isColorScheme(stored) ? stored : undefined;
}

/** Stores a colour scheme for this browser, and tells every reader in the tab. */
export function storeColorScheme(scheme: ColorScheme): void {
  if (readStoredColorScheme() === scheme) return;
  writeStorage(COLOR_SCHEME_STORAGE_KEY, scheme);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/**
 * Whether the site allows dark mode, as far as the page knows before the settings load: the api writes
 * `data-dark-mode="on|off"` on <html> (decision 0119); the Vite dev servers don't, so the last answer stored is used.
 */
export function readStoredDarkMode(): boolean | undefined {
  const fromPage = document.documentElement.getAttribute('data-dark-mode');
  const value = fromPage ?? readStorage(DARK_MODE_STORAGE_KEY);
  return value === 'on' ? true : value === 'off' ? false : undefined;
}

/** Remembers whether the site allows dark mode, for the next first paint. */
export function storeDarkMode(enabled: boolean): void {
  writeStorage(DARK_MODE_STORAGE_KEY, enabled ? 'on' : 'off');
}

/** Whether the device asks for dark mode. */
export function prefersDark(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia(DARK_QUERY).matches;
}

/** The scheme to draw: dark only when the site allows it and the preference (or, for `system`, the device) asks for it. */
export function resolveColorScheme(preference: ColorScheme, { enabled, systemDark }: { enabled: boolean; systemDark: boolean }): ResolvedColorScheme {
  if (!enabled) return 'light';
  if (preference === 'system') return systemDark ? 'dark' : 'light';
  return preference;
}

/** Draws the page in a scheme: dark mode sets `data-theme="dark"` on <html>, which swaps in the mirrored scales. */
export function applyColorScheme(scheme: ResolvedColorScheme): void {
  const root = document.documentElement;
  if (scheme === 'dark') root.setAttribute('data-theme', 'dark');
  else root.removeAttribute('data-theme');
}

/** Calls back whenever the stored colour scheme changes, in this tab or another. Returns the unsubscribe. */
export function subscribeToStoredColorScheme(onChange: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === COLOR_SCHEME_STORAGE_KEY) onChange();
  };
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener('storage', onStorage);
  };
}

/** Calls back whenever the device switches between light and dark. Returns the unsubscribe. */
export function subscribeToSystemColorScheme(onChange: () => void): () => void {
  if (typeof window.matchMedia !== 'function') return () => undefined;
  const query = window.matchMedia(DARK_QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

/**
 * The script each app's index.html runs first in its <head> (decision 0119), before anything is drawn, so a dark-mode
 * page never flashes light: it applies the stored scheme (or `fallback`, the app's default, when none is stored)
 * unless the site has dark mode off. It mirrors `resolveColorScheme()` and the storage keys above in plain ES5. Paste
 * its output into index.html exactly; a spec checks every app's copy.
 */
export function colorSchemeScript(fallback: ColorScheme): string {
  return (
    `(function(){try{var r=document.documentElement,s=window.localStorage,` +
    `a=r.getAttribute('data-dark-mode')||s.getItem('${DARK_MODE_STORAGE_KEY}'),` +
    `p=s.getItem('${COLOR_SCHEME_STORAGE_KEY}')||'${fallback}';` +
    `if(a!=='off'&&(p==='dark'||(p==='system'&&window.matchMedia('${DARK_QUERY}').matches)))r.setAttribute('data-theme','dark')}catch(e){}})();`
  );
}
