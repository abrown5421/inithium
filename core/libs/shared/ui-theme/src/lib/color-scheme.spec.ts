// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ColorScheme } from '@inithium/shared-contracts';
import {
  COLOR_SCHEME_STORAGE_KEY,
  DARK_MODE_STORAGE_KEY,
  colorSchemeScript,
  readStoredDarkMode,
  resolveColorScheme,
  storeColorScheme,
  subscribeToStoredColorScheme,
} from './color-scheme.service';
import { siteLogo, defaultLogo, defaultLogoDark } from './theme.config';

const root = document.documentElement;

/** Fakes the device's light/dark setting. */
const deviceIsDark = (dark: boolean) =>
  vi.stubGlobal('matchMedia', (query: string) => ({ matches: dark && query === '(prefers-color-scheme: dark)', addEventListener: () => undefined, removeEventListener: () => undefined }));

beforeEach(() => {
  localStorage.clear();
  root.removeAttribute('data-theme');
  root.removeAttribute('data-dark-mode');
  deviceIsDark(false);
});
afterEach(() => vi.unstubAllGlobals());

describe('resolving the colour scheme (decision 0119)', () => {
  it('follows the device for system, and the preference otherwise', () => {
    expect(resolveColorScheme('system', { enabled: true, systemDark: true })).toBe('dark');
    expect(resolveColorScheme('system', { enabled: true, systemDark: false })).toBe('light');
    expect(resolveColorScheme('dark', { enabled: true, systemDark: false })).toBe('dark');
    expect(resolveColorScheme('light', { enabled: true, systemDark: true })).toBe('light');
  });

  it('is always light while the site has dark mode off', () => {
    expect(resolveColorScheme('dark', { enabled: false, systemDark: true })).toBe('light');
    expect(resolveColorScheme('system', { enabled: false, systemDark: true })).toBe('light');
  });

  it("reads whether dark mode is allowed from the api's page first, then from storage", () => {
    expect(readStoredDarkMode()).toBeUndefined();
    localStorage.setItem(DARK_MODE_STORAGE_KEY, 'off');
    expect(readStoredDarkMode()).toBe(false);
    root.setAttribute('data-dark-mode', 'on');
    expect(readStoredDarkMode()).toBe(true);
  });

  it('tells readers in the tab when a new scheme is stored, and only then', () => {
    const changed = vi.fn();
    const unsubscribe = subscribeToStoredColorScheme(changed);
    storeColorScheme('dark');
    storeColorScheme('dark');
    expect(changed).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem(COLOR_SCHEME_STORAGE_KEY)).toBe('dark');
    unsubscribe();
  });
});

describe('the first-paint script (decision 0119)', () => {
  // Runs the script as index.html does: it's plain source, so evaluating it is the point of the test.
  // eslint-disable-next-line no-new-func
  const run = (fallback: ColorScheme) => new Function(colorSchemeScript(fallback))();
  const isDark = () => root.getAttribute('data-theme') === 'dark';

  it('applies the stored scheme, or the fallback without one', () => {
    run('system');
    expect(isDark()).toBe(false);
    deviceIsDark(true);
    run('system');
    expect(isDark()).toBe(true);

    root.removeAttribute('data-theme');
    run('light');
    expect(isDark()).toBe(false);
    localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, 'dark');
    run('light');
    expect(isDark()).toBe(true);
  });

  it('stays light while the site has dark mode off, from the page or from storage', () => {
    localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, 'dark');
    root.setAttribute('data-dark-mode', 'off');
    run('system');
    expect(isDark()).toBe(false);

    root.removeAttribute('data-dark-mode');
    localStorage.setItem(DARK_MODE_STORAGE_KEY, 'off');
    run('system');
    expect(isDark()).toBe(false);
  });

  it.each([
    ['web', 'system'],
    ['cms', 'system'],
    ['docs', 'light'],
  ] as const)("is in the %s app's index.html exactly", (app, fallback) => {
    const html = readFileSync(join(import.meta.dirname, '../../../../../apps', app, 'index.html'), 'utf8');
    expect(html).toContain(`<script>${colorSchemeScript(fallback)}</script>`);
  });
});

describe('the logo in each scheme (decision 0119)', () => {
  const logo = { assetId: 'light-id', alt: 'Acme' };
  const logoDark = { assetId: 'dark-id', alt: 'Acme' };

  it("uses the site's dark logo, then its own logo, and only then Inithium's dark one", () => {
    expect(siteLogo({ logo, logoDark }, 'dark').src).toBe('/api/assets/dark-id');
    expect(siteLogo({ logo }, 'dark').src).toBe('/api/assets/light-id');
    expect(siteLogo({}, 'dark')).toBe(defaultLogoDark);
  });

  it("uses the site's logo or Inithium's in light mode", () => {
    expect(siteLogo({ logo, logoDark }, 'light').src).toBe('/api/assets/light-id');
    expect(siteLogo({ logoDark }, 'light')).toBe(defaultLogo);
  });
});
