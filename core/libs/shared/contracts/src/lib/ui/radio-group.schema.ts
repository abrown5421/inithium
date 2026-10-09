import { z } from 'zod';
import { iconNameSchema } from './icon.schema';

/** How a RadioGroup draws its options (decision 0061): plain rows, or bordered cards. */
export const radioGroupVariants = ['plain', 'card'] as const;

/** Which way a RadioGroup lays out its options. */
export const radioGroupOrientations = ['vertical', 'horizontal'] as const;

export const radioGroupVariantSchema = z.enum(radioGroupVariants);
export const radioGroupOrientationSchema = z.enum(radioGroupOrientations);

/** One choice in a RadioGroup. */
export const radioOptionSchema = z
  .object({
    /** What the group's value becomes when this option is chosen. Unique within the group. */
    value: z.string().min(1),
    label: z.string().min(1),
    /** A line under the option's label. */
    helperText: z.string().optional(),
    disabled: z.boolean().optional(),
    /** A Lucide icon shown on the option, in the card variant. */
    icon: iconNameSchema.optional(),
  })
  .strict();

export type RadioOption = z.infer<typeof radioOptionSchema>;
