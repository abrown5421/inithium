import { useMemo } from 'react';
import { themeFontsCss, type ThemeFontFamily, type ThemeFonts as ThemeFontChoice } from '@inithium/shared-contracts';

export type ThemeFontsProps = {
  /** Every family in the library (the site bundle's `fontFamilies`). */
  families: readonly ThemeFontFamily[];
  /** The theme's fonts from settings; a role left out keeps Inithium's default. */
  fonts?: ThemeFontChoice;
};

/**
 * The client's theme fonts (decisions 0111, 0114): declares every library family and points `--font-display` /
 * `--font-body` at the families settings choose. The api already writes the same rules into the page; this applies
 * them again at runtime, so fonts changed in the CMS show without a reload (and in development, where Vite serves the
 * page). Render once, near the app root.
 */
export function ThemeFonts({ families, fonts }: ThemeFontsProps) {
  const css = useMemo(() => themeFontsCss(families, fonts), [families, fonts]);
  return css ? <style>{css}</style> : null;
}
