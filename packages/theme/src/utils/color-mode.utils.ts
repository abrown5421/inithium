import type { ColorMode, ThemeName } from '../types/theme.types.js';

export const COLOR_MODE_STORAGE_KEY = 'inithium-color-mode';
export const THEME_NAME_STORAGE_KEY = 'inithium-theme-name';

export const DEFAULT_COLOR_MODE: ColorMode = 'light';
export const DEFAULT_THEME_NAME: ThemeName = 'default';

export function getStoredColorMode(): ColorMode | null {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return null;
    }

    const value = localStorage.getItem(COLOR_MODE_STORAGE_KEY);
    if (value === 'light' || value === 'dark') {
      return value;
    }

    return null;
  } catch {
    return null;
  }
}

export function setStoredColorMode(mode: ColorMode): void {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }

    localStorage.setItem(COLOR_MODE_STORAGE_KEY, mode);
  } catch {
    // ignore
  }
}

export function getSystemColorMode(): ColorMode {
  try {
    if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') {
      return DEFAULT_COLOR_MODE;
    }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  } catch {
    return DEFAULT_COLOR_MODE;
  }
}

export function getStoredThemeName(): ThemeName | null {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return null;
    }

    const value = localStorage.getItem(THEME_NAME_STORAGE_KEY);
    return value ?? null;
  } catch {
    return null;
  }
}

export function setStoredThemeName(name: ThemeName): void {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }

    localStorage.setItem(THEME_NAME_STORAGE_KEY, name);
  } catch {
    // ignore
  }
}

