import { z } from 'zod';

export const fontFamilySchema = z.enum(['display', 'body']);

export const fontWeightSchema = z.literal([100, 200, 300, 400, 500, 600, 700, 800, 900]);

export const textAlignSchema = z.enum(['left', 'center', 'right', 'justify', 'start', 'end']);

/** Number of lines to show before an ellipsis (1 = single line), or false for no truncation. */
export const truncateSchema = z.union([z.number().int().min(1), z.literal(false)]);
