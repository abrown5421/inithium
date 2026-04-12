import { z } from 'zod';
import { mongoIdSchema, paginationQuerySchema, bulkDeleteBodySchema } from './primitives.js';

const trianglifyOptionsSchema = z.object({
  variance:  z.number(),
  cell_size: z.number(),
  x_colors:  z.array(z.string()),
  y_colors:  z.array(z.string()),
});

const avatarOptionsSchema = z.object({
  gradient: z.string().optional(),
  font:     z.string().optional(),
  variant:  z.enum(['square', 'circular']).optional(),
});

const genderSchema = z.discriminatedUnion('type', [
  z.object({ type: z.enum(['Male', 'Female', 'Prefer Not to Say']) }),
  z.object({ type: z.literal('Other'), custom: z.string().min(1) }),
]);

const addressSchema = z.object({
  street:  z.string().optional(),
  city:    z.string().optional(),
  state:   z.string().optional(),
  zip:     z.string().optional(),
  country: z.string().optional(),
});

const userRoleSchema = z.enum(['super-admin', 'admin', 'editor', 'writer', 'user']);

const userWriteSchema = z.object({
  email:        z.string().email(),
  password:     z.string().min(8),
  first_name:   z.string().min(1),
  last_name:    z.string().min(1),
  role:         userRoleSchema.optional(),
  user_banner:  trianglifyOptionsSchema.optional(),
  user_avatar:  avatarOptionsSchema.optional(),
  bio:          z.string().optional(),
  gender:       genderSchema.optional(),
  phone_number: z.string().optional(),
  dob:          z.string().optional(),
  address:      addressSchema.optional(),
});

const userPatchSchema = userWriteSchema.partial();

const bulkUpdateItemSchema = z.object({
  id:     mongoIdSchema,
  update: userPatchSchema,
});

export const userValidators = {
  createOne:   z.object({ body: userWriteSchema }),

  createMany: z.object({
    body: z.object({
      items: z.array(userWriteSchema).min(1, '`items` must be a non-empty array'),
    }),
  }),

  readOne: z.object({
    params: z.object({ id: mongoIdSchema }),
  }),

  readMany: z.object({
    query: paginationQuerySchema,
  }),

  updateOne: z.object({
    params: z.object({ id: mongoIdSchema }),
    body:   userPatchSchema,
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

  byRole: z.object({
    params: z.object({ role: userRoleSchema }),
  }),
};

export type UserWrite = z.infer<typeof userWriteSchema>;
export type UserPatch = z.infer<typeof userPatchSchema>;
