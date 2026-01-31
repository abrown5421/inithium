import { createContext, useContext, useState, ReactNode } from 'react';
import { Theme, ColorMode, lightTheme, darkTheme } from './theme';

interface ThemeContextProps {
  theme: Theme;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: lightTheme,
  toggleMode: () => {console.log('tog')},
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  initialMode?: ColorMode;
  children: ReactNode;
}

export const ThemeProvider = ({ initialMode = 'light', children }: ThemeProviderProps) => {
  const [mode, setMode] = useState<ColorMode>(initialMode);

  const toggleMode = () => setMode(prev => (prev === 'light' ? 'dark' : 'light'));

  const theme = mode === 'light' ? lightTheme : darkTheme;

  return (
    <ThemeContext.Provider value={{ theme, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
