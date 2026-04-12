import { z } from 'zod';
import { mongoIdSchema, paginationQuerySchema, bulkDeleteBodySchema } from './primitives.js';

const assetCategorySchema = z.enum(['image', 'font', 'audio', 'document', 'other']);

const assetWriteSchema = z.object({
  filename:        z.string().min(1),
  original_name:   z.string().min(1),
  mimetype:        z.string().min(1),
  size:            z.number().positive(),
  storage_key:     z.string().min(1),
  category:        assetCategorySchema,
  is_system_asset: z.boolean().optional(),
});

const assetPatchSchema = assetWriteSchema.partial();

const bulkUpdateItemSchema = z.object({
  id:     mongoIdSchema,
  update: assetPatchSchema,
});

export const assetValidators = {
  createOne: z.object({ body: assetWriteSchema }),

  createMany: z.object({
    body: z.object({
      items: z.array(assetWriteSchema).min(1, '`items` must be a non-empty array'),
    }),
  }),

  readOne: z.object({
    params: z.object({ id: mongoIdSchema }),
  }),

  readMany: z.object({
    query: paginationQuerySchema.extend({
      category: assetCategorySchema.optional(),
    }),
  }),

  updateOne: z.object({
    params: z.object({ id: mongoIdSchema }),
    body:   assetPatchSchema,
  }),

  updateMany: z.object({
    body: z.object({
      items: z.array(bulkUpdateItemSchema).min(1, '`items` must be a non-empty array'),
    }),
  }),

  deleteOne: z.object({
    params: z.object({ id: mongoIdSchema }),
  }),

  deleteMany: z.object({
    body: bulkDeleteBodySchema,
  }),
};

export type AssetWrite = z.infer<typeof assetWriteSchema>;
export type AssetPatch = z.infer<typeof assetPatchSchema>;
