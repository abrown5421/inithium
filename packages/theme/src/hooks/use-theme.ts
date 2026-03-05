import { useContext } from 'react';
import { ThemeContext } from '../context/theme.context.js';
import type { ThemeContextValue } from '../types/theme.types.js';

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (context === null) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}

