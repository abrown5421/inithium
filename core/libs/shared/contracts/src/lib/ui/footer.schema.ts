import { z } from 'zod';

/** How a Footer's rows line up (decision 0077). */
export const footerAligns = ['start', 'center'] as const;
export const footerAlignSchema = z.enum(footerAligns);

export type FooterAlign = z.infer<typeof footerAlignSchema>;
