import { z } from 'zod';
import { entranceAnimationSchema } from '../../ui/animation.schema';
import { colorValueSchema } from '../../ui/colors.schema';
import { polyPatternSchema } from '../../ui/poly-pattern.schema';
import { breakpoints } from '../../ui/variants.schema';
import { contentIdSchema } from '../content-common.schema';
import { contentBlockSchema } from './content-blocks-v1.schema';

// Version 1 of the content format (decision 0093, superseded by 0116). Kept so stored version 1 content can be read
// and upgraded; until the editor edits version 2, it's also what drafts are saved as.

/**
 * How a section splits into columns, as the share of the width each column takes. The number of columns a section
 * holds must match its layout.
 */
export const sectionLayouts = {
  one: [1],
  halves: [1, 1],
  'one-third-two-thirds': [1, 2],
  'two-thirds-one-third': [2, 1],
  thirds: [1, 1, 1],
  quarters: [1, 1, 1, 1],
} as const satisfies Record<string, readonly number[]>;

export type SectionLayout = keyof typeof sectionLayouts;

export const sectionLayoutSchema = z.enum(Object.keys(sectionLayouts) as [SectionLayout, ...SectionLayout[]]);

/** Each heading block level's size, on phones and from md up. */
export const headingSizesV1 = {
  1: { base: 36, md: 48 },
  2: { base: 28, md: 34 },
  3: { base: 22, md: 24 },
  4: { base: 18, md: 19 },
} as const;

/** A column: a stack of blocks. */
export const contentColumnSchema = z
  .object({
    id: contentIdSchema,
    blocks: z.array(contentBlockSchema).max(50, { error: 'Use 50 blocks or fewer in a column' }),
  })
  .strict();

const px = (max: number) => z.number().int().min(0).max(max);

/** A full-width band of the page, split into columns. */
export const contentSectionSchema = z
  .object({
    id: contentIdSchema,
    layout: sectionLayoutSchema,
    columns: z.array(contentColumnSchema).min(1).max(4),
    /** A colour behind the section. */
    bgColor: colorValueSchema.optional(),
    /** A PolyBanner pattern behind the section, drawn over bgColor. */
    banner: polyPatternSchema.optional(),
    textColor: colorValueSchema.optional(),
    /** Space inside the section, in px. Default 48 above and below, 24 at the sides. */
    padding: z.object({ y: px(400).optional(), x: px(400).optional() }).strict().optional(),
    /** The widest its content gets, in px; leave it out for full width (decision 0091). */
    maxWidth: z.number().int().min(320).max(4000).optional(),
    /** Space between columns, in px. Default 32. */
    gap: px(200).optional(),
    /** Where the columns' content sits vertically. Default 'start'. */
    verticalAlign: z.enum(['start', 'center', 'end', 'stretch']).optional(),
    /** Below this breakpoint the columns stack. Default 'md'. */
    stackBelow: z.enum(breakpoints).optional(),
    entrance: entranceAnimationSchema.optional(),
    /** An id for links to this section, e.g. 'pricing' for '#pricing'. */
    anchor: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Use lowercase words joined by hyphens').optional(),
  })
  .strict()
  .refine((section) => section.columns.length === sectionLayouts[section.layout].length, {
    error: 'The number of columns must match the layout',
    path: ['columns'],
  });

/** Version 1 of a content page's content: its sections, in order. */
export const contentDocumentV1Schema = z
  .object({
    schemaVersion: z.literal(1),
    sections: z.array(contentSectionSchema).max(50, { error: 'Use 50 sections or fewer' }),
  })
  .strict();

/** Stored version 1 content, or undefined when it isn't valid version 1 content. */
export const readContentDocumentV1 = (stored: unknown): z.infer<typeof contentDocumentV1Schema> | undefined =>
  contentDocumentV1Schema.safeParse(stored).data;

/** An empty version 1 document: one single-column section with no blocks. */
export function emptyContentDocumentV1(id: () => string): z.infer<typeof contentDocumentV1Schema> {
  return { schemaVersion: 1, sections: [{ id: id(), layout: 'one', columns: [{ id: id(), blocks: [] }] }] };
}
