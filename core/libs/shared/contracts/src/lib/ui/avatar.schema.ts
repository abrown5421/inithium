import { z } from 'zod';
import { colorValueSchema } from './colors.schema';

/** The DiceBear styles an Avatar may use (decision 0075), initials first as the default. */
export const avatarStyles = [
  'initials',
  'blobs',
  'bottts',
  'cameo',
  'disco',
  'gaze',
  'glass',
  'glyphs',
  'landscape',
  'loops',
  'moods',
  'patchwork',
  'planets',
  'rings',
] as const;

export const avatarFlips = ['none', 'horizontal', 'vertical', 'both'] as const;

/** The limits of an avatar's recipe (decision 0075). Scale is a percentage. */
export const avatarLimits = {
  rotate: { min: 0, max: 360, step: 15 },
  scale: { min: 50, max: 200, step: 10 },
} as const;

export const avatarStyleSchema = z.enum(avatarStyles);
export const avatarFlipSchema = z.enum(avatarFlips);

/**
 * An avatar's recipe (decision 0075): everything needed to draw the same DiceBear avatar again. This is what gets
 * stored, e.g. as a profile avatar; the image itself never is.
 */
export const avatarRecipeSchema = z
  .object({
    /** The DiceBear style. */
    style: avatarStyleSchema,
    /** Picks the avatar within its style: the same seed always draws the same avatar. */
    seed: z.string().min(1).max(64),
    /**
     * The circle behind the art: a colour, or 'transparent' for none. Leave it out for the style's own background
     * (for initials, a colour picked from the seed).
     */
    backgroundColor: colorValueSchema.optional(),
    /** Mirrors the art. Default 'none'. */
    flip: avatarFlipSchema.optional(),
    /** Turns the art, in degrees. Default 0. */
    rotate: z.number().min(avatarLimits.rotate.min).max(avatarLimits.rotate.max).optional(),
    /** Sizes the art within the circle, in percent. Default 100. */
    scale: z.number().min(avatarLimits.scale.min).max(avatarLimits.scale.max).optional(),
  })
  .strict();

export type AvatarStyle = z.infer<typeof avatarStyleSchema>;
export type AvatarFlip = z.infer<typeof avatarFlipSchema>;
export type AvatarRecipe = z.infer<typeof avatarRecipeSchema>;
