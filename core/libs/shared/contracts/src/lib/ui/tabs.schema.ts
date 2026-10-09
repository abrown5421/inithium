import { z } from 'zod';
import { iconNameSchema } from './icon.schema';

/** One tab's storable part (decision 0068): its value, label, icon and whether it's disabled. Its content isn't stored. */
export const tabItemSchema = z
  .object({
    /** Identifies the tab; the Tabs' value is the active tab's value. Unique and non-empty. */
    value: z.string().min(1),
    label: z.string().min(1),
    /** A Lucide icon before the label. */
    icon: iconNameSchema.optional(),
    disabled: z.boolean().optional(),
  })
  .strict();

export type TabItem = z.infer<typeof tabItemSchema>;
