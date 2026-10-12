import { z } from 'zod';
import { entranceAnimationSchema } from '../ui/animation.schema';
import { colorValueSchema } from '../ui/colors.schema';
import { polyPatternSchema } from '../ui/poly-pattern.schema';
import { breakpoints } from '../ui/variants.schema';
import { contentBlockSchema, contentIdSchema } from './content-blocks.schema';

/**
 * How a section splits into columns (decision 0093), as the share of the width each column takes. The number of
 * columns a section holds must match its layout.
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

/** The current version of the content format. Bump it, with an upgrade in `readContentDocument`, when it changes. */
export const CONTENT_SCHEMA_VERSION = 1;

/** A content page's content (decision 0093): its sections, in order. */
export const contentDocumentSchema = z
  .object({
    schemaVersion: z.literal(CONTENT_SCHEMA_VERSION),
    sections: z.array(contentSectionSchema).max(50, { error: 'Use 50 sections or fewer' }),
  })
  .strict();

/** A content page's working draft and its published version, which is what visitors see. */
export const pageContentSchema = z
  .object({
    draft: contentDocumentSchema,
    /** Null until the draft is first published. */
    published: contentDocumentSchema.nullable(),
  })
  .strict();

/**
 * Reads stored content of any version, upgrading older versions to the current one (decision 0093). Returns
 * undefined when it isn't valid content.
 */
export function readContentDocument(stored: unknown): z.infer<typeof contentDocumentSchema> | undefined {
  // Version 1 is the first; upgrades from older versions are added here as the format changes.
  return contentDocumentSchema.safeParse(stored).data;
}

/** An empty content document: one single-column section with no blocks. */
export function emptyContentDocument(id: () => string): z.infer<typeof contentDocumentSchema> {
  return {
    schemaVersion: CONTENT_SCHEMA_VERSION,
    sections: [{ id: id(), layout: 'one', columns: [{ id: id(), blocks: [] }] }],
  };
}
