import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  applyDarkMode,
  persistDarkMode,
  getPersistedDarkMode,
  initDarkMode,
} from './dark-mode';

beforeEach(() => {
  document.documentElement.className = '';
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('dark mode utilities', () => {
  describe('applyDarkMode', () => {
    it('adds dark class when enabled', () => {
      applyDarkMode(true);

      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('removes dark class when disabled', () => {
      document.documentElement.classList.add('dark');

      applyDarkMode(false);

      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  describe('persistDarkMode', () => {
    it('stores true as string in localStorage', () => {
      persistDarkMode(true);

      expect(localStorage.getItem('dark_mode')).toBe('true');
    });

    it('stores false as string in localStorage', () => {
      persistDarkMode(false);

      expect(localStorage.getItem('dark_mode')).toBe('false');
    });
  });

  describe('getPersistedDarkMode', () => {
    it('returns null when nothing is stored', () => {
      expect(getPersistedDarkMode()).toBeNull();
    });

    it('returns true when stored value is "true"', () => {
      localStorage.setItem('dark_mode', 'true');

      expect(getPersistedDarkMode()).toBe(true);
    });

    it('returns false when stored value is "false"', () => {
      localStorage.setItem('dark_mode', 'false');

      expect(getPersistedDarkMode()).toBe(false);
    });
  });

  describe('initDarkMode', () => {
    it('uses persisted value when available', () => {
      localStorage.setItem('dark_mode', 'true');

      initDarkMode(false);

      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(localStorage.getItem('dark_mode')).toBe('true');
    });

    it('falls back to userPreference when no persisted value exists', () => {
      initDarkMode(true);

      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(localStorage.getItem('dark_mode')).toBe('true');
    });

    it('defaults to false when nothing is provided', () => {
      initDarkMode();

      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(localStorage.getItem('dark_mode')).toBe('false');
    });

    it('persists computed value after initialization', () => {
      initDarkMode(true);

      expect(localStorage.getItem('dark_mode')).toBe('true');
    });
  });
});