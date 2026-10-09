import { z } from 'zod';

/** The six theme tokens (decision 0031). */
export const themeColors = ['primary', 'secondary', 'tertiary', 'quaternary', 'accent', 'surface'] as const;

/** Tailwind v4's palette colours, available in code and in CMS colour controls (decision 0067). */
export const tailwindColors = [
  'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet',
  'purple', 'fuchsia', 'pink', 'rose', 'slate', 'gray', 'zinc', 'neutral', 'stone', 'mauve', 'olive', 'mist', 'taupe',
] as const;

export const intensities = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

export const themeColorSchema = z.enum(themeColors);
export const colorNameSchema = z.enum([...themeColors, ...tailwindColors]);
export const intensitySchema = z.literal(intensities);

/** A colour other than 'transparent': `{ color, intensity, opacity? }` or a colour name meaning intensity 500. */
export const solidColorValueSchema = z.union([
  colorNameSchema,
  z
    .object({
      color: colorNameSchema,
      intensity: intensitySchema,
      opacity: z.number().min(0).max(100).optional(),
    })
    .strict(),
]);

/**
 * A colour: `{ color, intensity, opacity? }`, a colour name meaning intensity 500, or 'transparent'.
 * Opacity is a percentage (0–100).
 */
export const colorValueSchema = z.union([z.literal('transparent'), solidColorValueSchema]);
