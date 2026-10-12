import { useMemo } from 'react';
import type { ThemeConfig } from '@inithium/shared-contracts';
import { defaultTheme } from './theme.config';
import { themeToCss } from './theme.service';

/**
 * Publishes the theme's colour scales as CSS custom properties. Render once, near the app root. A theme that can't
 * be generated (e.g. a surface too dark for readable text) falls back to the default, so it never breaks the app.
 */
export function ThemeStyles({ theme = defaultTheme }: { theme?: ThemeConfig }) {
  const css = useMemo(() => {
    try {
      return themeToCss(theme);
    } catch (error) {
      console.warn('[theme] using the default theme:', (error as Error).message);
      return themeToCss(defaultTheme);
    }
  }, [theme]);
  return <style>{css}</style>;
}
