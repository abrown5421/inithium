import { z } from 'zod';

/** How a Button applies its colour (decision 0054). */
export const buttonVariants = ['filled', 'outlined', 'ghost', 'link'] as const;

export const buttonVariantSchema = z.enum(buttonVariants);

export type ButtonVariant = z.infer<typeof buttonVariantSchema>;
