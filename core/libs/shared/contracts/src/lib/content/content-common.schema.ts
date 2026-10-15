import { z } from 'zod';
import { fontFamilySchema, fontWeightSchema } from '../ui/typography.schema';

// Shapes every version of the content format uses (decisions 0093, 0116).

/** A stable id for a part of a page's content, unique within its page (e.g. 'b7k2x9'). */
export const contentIdSchema = z.string().regex(/^[a-zA-Z0-9_-]{1,40}$/, 'Use up to 40 letters, numbers, - or _');

/** A new random id for a part of a page's content, e.g. 'k3x9q1za'. */
export const createContentId = (): string => Math.random().toString(36).slice(2, 10).padEnd(8, '0');

/** Where content sits across its space. */
export const contentAlignSchema = z.enum(['start', 'center', 'end']);

const fontSizePx = z.number().int().min(8, { error: 'Use 8px or more' }).max(160, { error: 'Use 160px or less' });

/**
 * A text part's typography (decision 0115): its font, weight and size, each optional. Left out, the part keeps its
 * default. The size is in px, with `md` for the medium breakpoint and up. Colour is a separate field.
 */
export const contentTypographySchema = z
  .object({
    fontFamily: fontFamilySchema.optional(),
    fontWeight: fontWeightSchema.optional(),
    fontSize: z.object({ base: fontSizePx, md: fontSizePx.optional() }).strict().optional(),
  })
  .strict();

/** A required short text, trimmed, e.g. a button's label. */
export const contentShortTextSchema = (max: number, what: string) =>
  z.string().trim().min(1, { error: `Enter ${what}` }).max(max, { error: `Use ${max} characters or fewer` });
