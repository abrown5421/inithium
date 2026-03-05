import type React from 'react';

export type ColorMode = 'light' | 'dark';

export type ThemeName = string;

export interface ThemeContextValue {
  colorMode: ColorMode;
  toggleColorMode: () => void;
  setColorMode: (mode: ColorMode) => void;
  themeName: ThemeName;
  setThemeName: (name: ThemeName) => void;
  isLoading: boolean;
}

export interface ThemeProviderProps {
  children: React.ReactNode;
  initialColorMode?: ColorMode;
  initialThemeName?: ThemeName;
  onThemeChange?: (colorMode: ColorMode, themeName: ThemeName) => void;
  serverColorMode?: ColorMode;
}

export interface TokenMap {
  [key: string]: string;
}

