const STORAGE_KEY = 'dark_mode';

export const applyDarkMode = (enabled: boolean) => {
  const root = document.documentElement;

  if (enabled) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

export const persistDarkMode = (enabled: boolean) => {
  localStorage.setItem(STORAGE_KEY, String(enabled));
};

export const getPersistedDarkMode = (): boolean | null => {
  const value = localStorage.getItem(STORAGE_KEY);

  if (value === null) return null;

  return value === 'true';
};

export const initDarkMode = (userPreference?: boolean) => {
  const persisted = getPersistedDarkMode();

  const enabled =
    persisted !== null ? persisted : userPreference ?? false;

  applyDarkMode(enabled);
  persistDarkMode(enabled);

  return enabled;
};