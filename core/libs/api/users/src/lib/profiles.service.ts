import { randomInt } from 'node:crypto';
import {
  avatarRecipeSchema,
  polyPatternSchema,
  type AvatarRecipe,
  type PolyPattern,
  type PolyPatternColor,
} from '@inithium/shared-contracts';

/** The theme's brand tokens: stored as references, so a generated banner follows a re-brand. */
const BRAND_COLORS = ['primary', 'secondary', 'tertiary', 'quaternary', 'accent'] as const;
const BANNER_INTENSITIES = [200, 300, 400, 500, 600, 700, 800] as const;

// Generated banners stay within these, inside the recipe's own limits (decision 0074), so none is a near-regular
// grid or so fine it's slow to draw.
const BANNER_CELL_SIZE = { min: 40, max: 150, step: 5 };
const BANNER_VARIANCE = { min: 0.3, max: 1, step: 0.05 };
const BANNER_COLORS = { min: 2, max: 4 };

const pick = <T>(values: readonly T[]): T => values[randomInt(values.length)] as T;
const stepped = ({ min, max, step }: { min: number; max: number; step: number }) =>
  Math.round((min + randomInt(Math.round((max - min) / step) + 1) * step) * 100) / 100;

const randomStops = (): PolyPatternColor[] =>
  Array.from({ length: randomInt(BANNER_COLORS.min, BANNER_COLORS.max + 1) }, () => ({
    color: pick(BRAND_COLORS),
    intensity: pick(BANNER_INTENSITIES),
  }));

/** A random 8-character seed, e.g. 'k3x9q1za'. */
const randomSeed = () => Array.from({ length: 8 }, () => pick([...'abcdefghijklmnopqrstuvwxyz0123456789'])).join('');

/**
 * A new account's banner (decision 0090): the theme's brand colours in random order, intensities and counts along
 * both gradients, with a random cell size, variance and seed.
 */
export function createProfileBanner(): PolyPattern {
  return {
    cellSize: stepped(BANNER_CELL_SIZE),
    variance: stepped(BANNER_VARIANCE),
    xColors: randomStops(),
    yColors: randomStops(),
    seed: randomSeed(),
  };
}

/** A new account's avatar (decision 0090): initials on the primary colour, seeded by the account's id. */
export function createProfileAvatar(userId: string): AvatarRecipe {
  return { style: 'initials', seed: userId.slice(0, 64), backgroundColor: 'primary' };
}

/** A stored avatar recipe, or undefined when it's missing or no longer valid. */
export const readAvatar = (value: unknown): AvatarRecipe | undefined => avatarRecipeSchema.safeParse(value).data;

/** A stored banner recipe, or undefined when it's missing or no longer valid. */
export const readBanner = (value: unknown): PolyPattern | undefined => polyPatternSchema.safeParse(value).data;
