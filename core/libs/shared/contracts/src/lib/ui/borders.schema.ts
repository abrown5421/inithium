import { z } from 'zod';
import { sidesSchema } from './spacing.schema';

export const borderWidthSchema = sidesSchema(z.number().min(0));

export const borderStyleSchema = z.enum(['solid', 'dashed', 'dotted', 'double', 'none']);

/**
 * Corner radius in pixels. A side sets both of its corners. Precedence: a corner, then top/bottom,
 * then left/right, then all.
 */
export const radiusSchema = z
  .object({
    all: z.number().min(0).optional(),
    top: z.number().min(0).optional(),
    right: z.number().min(0).optional(),
    bottom: z.number().min(0).optional(),
    left: z.number().min(0).optional(),
    topLeft: z.number().min(0).optional(),
    topRight: z.number().min(0).optional(),
    bottomRight: z.number().min(0).optional(),
    bottomLeft: z.number().min(0).optional(),
  })
  .strict();

/** Tailwind's shadow sizes (decision 0042); the colour is the separate shadowColor prop. */
export const shadowSizeSchema = z.enum(['none', '2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl']);
