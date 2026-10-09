import { z } from 'zod';
import { iconNameSchema } from './icon.schema';

/** One choice in a Select (decision 0062). */
export const selectOptionSchema = z
  .object({
    /** What the Select's value becomes when this option is chosen. Unique and non-empty. */
    value: z.string().min(1),
    label: z.string().min(1),
    /** A Lucide icon shown before the label in the list. */
    icon: iconNameSchema.optional(),
    disabled: z.boolean().optional(),
  })
  .strict();

/** Options shown together under a heading, e.g. 'Europe'. */
export const selectOptionGroupSchema = z
  .object({
    label: z.string().min(1),
    options: z.array(selectOptionSchema).min(1),
  })
  .strict();

/** A Select's list: options and groups of options, in order. */
export const selectOptionsSchema = z.array(z.union([selectOptionSchema, selectOptionGroupSchema])).min(1);

export type SelectOption = z.infer<typeof selectOptionSchema>;
export type SelectOptionGroup = z.infer<typeof selectOptionGroupSchema>;
