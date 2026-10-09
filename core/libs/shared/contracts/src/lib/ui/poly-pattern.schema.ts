import { z } from 'zod';
import { colorNameSchema, intensitySchema } from './colors.schema';

/** The limits of a poly pattern's recipe (decision 0074). */
export const polyPatternLimits = {
  cellSize: { min: 25, max: 250, step: 5 },
  variance: { min: 0, max: 1, step: 0.05 },
  colors: { min: 1, max: 8 },
} as const;

/** One stop of a poly pattern's gradient: a theme token or Tailwind colour at an intensity (no opacity). */
export const polyPatternColorSchema = z
  .object({
    color: colorNameSchema,
    intensity: intensitySchema,
  })
  .strict();

const polyPatternColorsSchema = z
  .array(polyPatternColorSchema)
  .min(polyPatternLimits.colors.min)
  .max(polyPatternLimits.colors.max);

/**
 * A poly pattern's recipe (decision 0074): everything needed to draw the same low-poly banner again, at any size.
 * This is what gets stored, e.g. as a profile banner; the image itself never is.
 */
export const polyPatternSchema = z
  .object({
    /** The size of the grid the triangles are made from, in px. Larger is coarser. */
    cellSize: z.number().int().min(polyPatternLimits.cellSize.min).max(polyPatternLimits.cellSize.max),
    /** How far each grid point may wander, from 0 (a regular grid) to 1. */
    variance: z.number().min(polyPatternLimits.variance.min).max(polyPatternLimits.variance.max),
    /** The gradient from left to right. */
    xColors: polyPatternColorsSchema,
    /** The gradient from top to bottom. Leave it out to reuse xColors. */
    yColors: polyPatternColorsSchema.optional(),
    /** Makes the randomness repeatable: the same seed always draws the same pattern. */
    seed: z.string().min(1).max(64),
  })
  .strict();

export type PolyPatternColor = z.infer<typeof polyPatternColorSchema>;
export type PolyPattern = z.infer<typeof polyPatternSchema>;
