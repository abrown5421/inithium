import { themeColors, type ThemeColor, type ThemeConfig } from '@inithium/shared-contracts';
import { generateBrandScale, generateSurfaceScale, scaleSteps, type ColorScale, type ScaleStep } from './color-scales.service';

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

/**
 * The step a step shows in dark mode (decision 0119): the scale read from the other end, so 50 ↔ 950, 100 ↔ 900 …
 * and 500 stays. Backgrounds (50–400) become dark and text (600–950) light, and every text/background pair keeps its
 * contrast, because it's the same two colours swapped.
 */
export function mirroredStep(step: ScaleStep): ScaleStep {
  return (1000 - step) as ScaleStep;
}

/** The CSS selector dark mode's mirrored scales sit under. The colour scheme sets it on <html>. */
export const DARK_THEME_SELECTOR = ':root[data-theme="dark"]';

/**
 * The theme as CSS custom properties, e.g. --color-primary-500: the scales on :root, and mirrored under
 * `:root[data-theme="dark"]` for dark mode (decision 0119). Only the theme's six tokens mirror; Tailwind's palette
 * colours never do.
 */
export function themeToCss(theme: ThemeConfig): string {
  const scales = generateThemeScales(theme);
  const declarations = (stepFor: (step: ScaleStep) => ScaleStep) =>
    themeColors.flatMap((token) => scaleSteps.map((step) => `--color-${token}-${step}:${scales[token][stepFor(step)]};`)).join('');
  return `:root{${declarations((step) => step)}}${DARK_THEME_SELECTOR}{color-scheme:dark;${declarations(mirroredStep)}}`;
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
