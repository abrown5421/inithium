import { z } from 'zod';
import { sizeValueSchema } from './sizing.schema';
import { withVariants } from './variants.schema';

// Layout objects take variant keys per field, e.g. grid={{ columns: { base: 1, md: 3 } }} (decision 0043).

/** A gap in pixels: one value for both axes, or { x, y }. */
export const gapSchema = withVariants(
  z.union([z.number().min(0), z.object({ x: z.number().min(0).optional(), y: z.number().min(0).optional() }).strict()]),
);

export const alignItemsSchema = z.enum(['start', 'center', 'end', 'stretch', 'baseline']);
export const justifyContentSchema = z.enum(['start', 'center', 'end', 'between', 'around', 'evenly']);
export const justifyItemsSchema = z.enum(['start', 'center', 'end', 'stretch']);

export const flexSchema = z
  .object({
    direction: withVariants(z.enum(['row', 'column', 'row-reverse', 'column-reverse'])).optional(),
    align: withVariants(alignItemsSchema).optional(),
    justify: withVariants(justifyContentSchema).optional(),
    wrap: withVariants(z.enum(['wrap', 'nowrap', 'wrap-reverse'])).optional(),
    gap: gapSchema.optional(),
  })
  .strict();

/** columns/rows: a number of equal tracks. */
export const gridSchema = z
  .object({
    columns: withVariants(z.number().int().min(1)).optional(),
    rows: withVariants(z.number().int().min(1)).optional(),
    align: withVariants(alignItemsSchema).optional(),
    justify: withVariants(justifyItemsSchema).optional(),
    gap: gapSchema.optional(),
  })
  .strict();

/** Offsets in pixels (negative allowed), with the same precedence as spacing: a side overrides x/y, which override all. */
export const positionSchema = z
  .object({
    type: withVariants(z.enum(['static', 'relative', 'absolute', 'fixed', 'sticky'])).optional(),
    all: withVariants(z.number()).optional(),
    x: withVariants(z.number()).optional(),
    y: withVariants(z.number()).optional(),
    top: withVariants(z.number()).optional(),
    right: withVariants(z.number()).optional(),
    bottom: withVariants(z.number()).optional(),
    left: withVariants(z.number()).optional(),
    z: withVariants(z.number().int()).optional(),
  })
  .strict();

const overflowValueSchema = z.enum(['visible', 'hidden', 'auto', 'scroll', 'clip']);

export const overflowSchema = z
  .object({
    all: withVariants(overflowValueSchema).optional(),
    x: withVariants(overflowValueSchema).optional(),
    y: withVariants(overflowValueSchema).optional(),
  })
  .strict();

export const alignSelfSchema = z.enum(['auto', 'start', 'center', 'end', 'stretch', 'baseline']);

/** How a Container behaves as a child of a flex container. */
export const flexItemSchema = z
  .object({
    grow: withVariants(z.number().min(0)).optional(),
    shrink: withVariants(z.number().min(0)).optional(),
    basis: withVariants(sizeValueSchema).optional(),
    alignSelf: withVariants(alignSelfSchema).optional(),
    order: withVariants(z.number().int()).optional(),
  })
  .strict();

/** How a Container behaves as a child of a grid container. 'full' spans every track. */
export const gridItemSchema = z
  .object({
    colSpan: withVariants(z.union([z.number().int().min(1), z.literal('full')])).optional(),
    rowSpan: withVariants(z.union([z.number().int().min(1), z.literal('full')])).optional(),
    alignSelf: withVariants(alignSelfSchema).optional(),
  })
  .strict();
