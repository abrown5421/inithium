import {
  inject,
  provide,
  ref,
  computed,
  type Ref,
  type InjectionKey,
} from 'vue';
import { lightTheme, darkTheme, type Theme } from './tokens';

export const THEME_KEY: InjectionKey<{
  theme: Ref<Theme>;
  isDark: Ref<boolean>;
  toggleMode: () => void;
  setMode: (mode: 'light' | 'dark') => void;
}> = Symbol('inithium-theme');

export function provideTheme(initialMode: 'light' | 'dark' = 'light') {
  const mode = ref<'light' | 'dark'>(initialMode);

  const theme = computed<Theme>(() =>
    mode.value === 'dark' ? darkTheme : lightTheme
  );

  const isDark = computed(() => mode.value === 'dark');

  function toggleMode() {
    mode.value = mode.value === 'light' ? 'dark' : 'light';
  }

  function setMode(m: 'light' | 'dark') {
    mode.value = m;
  }

  provide(THEME_KEY, { theme, isDark, toggleMode, setMode });

  return { theme, isDark, toggleMode, setMode };
}

export function useTheme() {
  const ctx = inject(THEME_KEY);
  if (!ctx) throw new Error('useTheme() must be used inside a <ThemeProvider>');
  return ctx;
}
