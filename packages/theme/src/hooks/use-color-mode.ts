import type { ThemeContextValue } from '../types/theme.types.js';
import { useTheme } from './use-theme.js';

export function useColorMode(): Pick<
  ThemeContextValue,
  'colorMode' | 'toggleColorMode' | 'setColorMode'
> {
  const { colorMode, toggleColorMode, setColorMode } = useTheme();

  return {
    colorMode,
    toggleColorMode,
    setColorMode,
  };
}

