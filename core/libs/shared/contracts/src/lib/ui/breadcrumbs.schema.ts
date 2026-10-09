import { z } from 'zod';
import { iconNameSchema } from './icon.schema';

/** One step in a Breadcrumbs trail (decision 0072). The last is the current page. */
export const breadcrumbItemSchema = z
  .object({
    label: z.string().min(1),
    /** Where the step links to. Without it, the step is plain text. The current page never links. */
    href: z.string().min(1).optional(),
    /** A Lucide icon before the label. */
    icon: iconNameSchema.optional(),
    /** Shows only the icon; the label stays for screen readers and in a tooltip. */
    iconOnly: z.boolean().optional(),
  })
  .strict();

export type BreadcrumbItem = z.infer<typeof breadcrumbItemSchema>;
