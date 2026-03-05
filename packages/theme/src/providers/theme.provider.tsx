import React, { useEffect, useMemo, useState } from 'react';
import { ThemeContext } from '../context/theme.context.js';
import type {
  ThemeProviderProps,
  ColorMode,
  ThemeName,
  ThemeContextValue,
} from '../types/theme.types.js';
import {
  DEFAULT_COLOR_MODE,
  DEFAULT_THEME_NAME,
  getStoredColorMode,
  getStoredThemeName,
  getSystemColorMode,
  setStoredColorMode,
  setStoredThemeName,
} from '../utils/color-mode.utils.js';

export function ThemeProvider(props: ThemeProviderProps): React.JSX.Element {
  const { children, initialColorMode, initialThemeName, onThemeChange, serverColorMode } =
    props;

  const [colorMode, setColorModeState] = useState<ColorMode>(DEFAULT_COLOR_MODE);
  const [themeName, setThemeNameState] = useState<ThemeName>(DEFAULT_THEME_NAME);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    const storedMode = getStoredColorMode();
    const resolvedMode =
      initialColorMode ?? storedMode ?? getSystemColorMode() ?? DEFAULT_COLOR_MODE;

    const storedTheme = getStoredThemeName();
    const resolvedTheme = initialThemeName ?? storedTheme ?? DEFAULT_THEME_NAME;

    setColorModeState(resolvedMode);
    setThemeNameState(resolvedTheme);
    setIsLoading(false);
  }, [initialColorMode, initialThemeName]);

  useEffect(() => {
    if (typeof serverColorMode === 'undefined') {
      return;
    }

    setColorModeState((current) =>
      current === serverColorMode ? current : serverColorMode
    );
  }, [serverColorMode]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    const root = document.documentElement;

    if (colorMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    setStoredColorMode(colorMode);

    if (onThemeChange) {
      onThemeChange(colorMode, themeName);
    }
  }, [colorMode, themeName, onThemeChange]);

  // Apply theme name side effects
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    const root = document.documentElement;
    root.setAttribute('data-theme', themeName);

    setStoredThemeName(themeName);

    if (onThemeChange) {
      onThemeChange(colorMode, themeName);
    }
  }, [themeName, colorMode, onThemeChange]);

  const toggleColorMode = (): void => {
    setColorModeState((current) => (current === 'light' ? 'dark' : 'light'));
  };

  const setColorMode = (mode: ColorMode): void => {
    setColorModeState(mode);
  };

  const setThemeName = (name: ThemeName): void => {
    setThemeNameState(name);
  };

  const value: ThemeContextValue = useMemo(
    () => ({
      colorMode,
      toggleColorMode,
      setColorMode,
      themeName,
      setThemeName,
      isLoading,
    }),
    [colorMode, themeName, isLoading]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

