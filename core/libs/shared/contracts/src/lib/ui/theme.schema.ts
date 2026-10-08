import { z } from 'zod';

const hexColorSchema = z.string().regex(/^#[0-9a-f]{6}$/i, { error: 'Use a 6-digit hex colour, e.g. #006a8e' });

/**
 * A client's theme. Brand tokens give their 500 colour; surface gives its 100 colour (decision 0031).
 * Every other step is generated.
 */
export const themeConfigSchema = z.object({
  colors: z
    .object({
      primary: hexColorSchema,
      secondary: hexColorSchema,
      tertiary: hexColorSchema,
      quaternary: hexColorSchema,
      accent: hexColorSchema,
      surface: hexColorSchema,
    })
    .strict(),
});
