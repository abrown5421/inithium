const DARK_MODE_KEY = 'dark_mode';

export const applyDarkMode = (enabled: boolean): void => {
  const root = document.documentElement;
  if (enabled) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

export const persistDarkMode = (enabled: boolean): void => {
  localStorage.setItem(DARK_MODE_KEY, String(enabled));
};

export const getPersistedDarkMode = (): boolean | null => {
  const stored = localStorage.getItem(DARK_MODE_KEY);
  if (stored === null) return null;
  return stored === 'true';
};

export const initDarkMode = (userPreference?: boolean): void => {
  const persisted = getPersistedDarkMode();
  const enabled = persisted !== null ? persisted : (userPreference ?? false);
  applyDarkMode(enabled);
  persistDarkMode(enabled);
};