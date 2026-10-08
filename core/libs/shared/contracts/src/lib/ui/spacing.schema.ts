import { z } from 'zod';

/**
 * Pixel values per side. A side overrides x/y, which override all (decision 0042).
 * Used by margin, padding, border width and position offsets.
 */
export function sidesSchema(value: z.ZodNumber) {
  return z
    .object({
      all: value.optional(),
      x: value.optional(),
      y: value.optional(),
      top: value.optional(),
      right: value.optional(),
      bottom: value.optional(),
      left: value.optional(),
    })
    .strict();
}

/** Margin allows negative values; padding doesn't. */
export const marginSchema = sidesSchema(z.number());
export const paddingSchema = sidesSchema(z.number().min(0));
