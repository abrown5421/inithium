import { createContext } from 'react';
import type { ThemeContextValue } from '../types/theme.types.js';

export const ThemeContext = createContext<ThemeContextValue | null>(null);

