import { useMemo } from 'react';
import type { ThemeConfig } from '@inithium/shared-contracts';
import { defaultTheme } from './theme.config';
import { themeToCss } from './theme.service';

/** Publishes the theme's colour scales as CSS custom properties. Render once, near the app root. */
export function ThemeStyles({ theme = defaultTheme }: { theme?: ThemeConfig }) {
  const css = useMemo(() => themeToCss(theme), [theme]);
  return <style>{css}</style>;
}
