import { z } from 'zod';

/** Which colours a ColorPicker offers (decision 0069): theme tokens and Tailwind's palette, or theme tokens only. */
export const colorPickerPalettes = ['all', 'theme'] as const;

export const colorPickerPaletteSchema = z.enum(colorPickerPalettes);

export type ColorPickerPalette = z.infer<typeof colorPickerPaletteSchema>;
