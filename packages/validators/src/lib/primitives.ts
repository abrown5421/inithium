import { z } from 'zod';

export const mongoIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, 'Must be a valid MongoDB ObjectId');

export const paginationQuerySchema = z.object({
  page:  z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  sort:  z.string().optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

export const bulkDeleteBodySchema = z.object({
  ids: z
    .array(mongoIdSchema)
    .min(1, '`ids` must be a non-empty array'),
});
