import { z } from 'zod';

/** Which way a Divider runs (decision 0060). */
export const dividerOrientations = ['horizontal', 'vertical'] as const;

/** A Divider's line styles. */
export const dividerLineStyles = ['solid', 'dashed', 'dotted'] as const;

/** Where a Divider's label sits along the line. */
export const dividerLabelAligns = ['start', 'center', 'end'] as const;

export const dividerOrientationSchema = z.enum(dividerOrientations);
export const dividerLineStyleSchema = z.enum(dividerLineStyles);
export const dividerLabelAlignSchema = z.enum(dividerLabelAligns);

export type DividerOrientation = z.infer<typeof dividerOrientationSchema>;
