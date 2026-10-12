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

/**
 * Why a colour can't be a token's chosen step, or null when it can (decision 0087). A surface colour must be light
 * enough that its generated text steps meet WCAG AA against it; brand colours always work.
 */
export function themeColorProblem(token: ThemeColor, hex: string): string | null {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return 'Use a 6-digit hex colour, e.g. #006a8e';
  if (token !== 'surface') return null;
  try {
    generateSurfaceScale(hex);
    return null;
  } catch {
    return 'Too dark for a page background: no text colour would be readable on it. Choose a lighter colour.';
  }
}
