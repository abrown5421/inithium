import { z } from 'zod';

/** The animations a Loader can play (decision 0058). */
export const loaderVariants = [
  'spinner',
  'dots',
  'bars',
  'pulse',
  'progress',
  'ring',
  'orbit',
  'wave',
  'grid',
  'segments',
] as const;

export const loaderVariantSchema = z.enum(loaderVariants);

export type LoaderVariant = z.infer<typeof loaderVariantSchema>;
