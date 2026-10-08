import { themeColors, type ThemeColor, type ThemeConfig } from '@inithium/shared-contracts';
import { generateBrandScale, generateSurfaceScale, scaleSteps, type ColorScale } from './color-scales.service';

export type ThemeScales = Record<ThemeColor, ColorScale>;

/** Generates all six token scales from a theme config. */
export function generateThemeScales(theme: ThemeConfig): ThemeScales {
  return Object.fromEntries(
    themeColors.map((token) => [
      token,
      token === 'surface' ? generateSurfaceScale(theme.colors.surface) : generateBrandScale(theme.colors[token]),
    ]),
  ) as ThemeScales;
}

/** The theme as CSS custom properties on :root, e.g. --color-primary-500. */
export function themeToCss(theme: ThemeConfig): string {
  const scales = generateThemeScales(theme);
  const declarations = themeColors.flatMap((token) =>
    scaleSteps.map((step) => `--color-${token}-${step}:${scales[token][step]};`),
  );
  return `:root{${declarations.join('')}}`;
}
