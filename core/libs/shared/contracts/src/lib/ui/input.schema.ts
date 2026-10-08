import { z } from 'zod';

/** How an Input draws its field (decision 0055). */
export const inputVariants = ['outlined', 'filled', 'standard'] as const;

/** The single-line types an Input supports. Multiline text is a separate component. */
export const inputTypes = ['text', 'email', 'password', 'search', 'tel', 'url', 'number'] as const;

export const inputVariantSchema = z.enum(inputVariants);
export const inputTypeSchema = z.enum(inputTypes);

export type InputVariant = z.infer<typeof inputVariantSchema>;
export type InputType = z.infer<typeof inputTypeSchema>;
