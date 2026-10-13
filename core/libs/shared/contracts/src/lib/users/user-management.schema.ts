import { z } from 'zod';
import { emailSchema } from '../auth/auth.schema';
import { avatarRecipeSchema } from '../ui/avatar.schema';
import { profileLimits, roleSchema } from './users.schema';

const nameSchema = (required: string) =>
  z.string().trim().min(1, { error: required }).max(profileLimits.name, { error: `Use ${profileLimits.name} characters or fewer` });
const lastNameSchema = z.string().trim().max(profileLimits.name, { error: `Use ${profileLimits.name} characters or fewer` });

/** An account as the CMS's Users screen lists it (decision 0100). Never includes credentials. */
export const managedUserSchema = z.object({
  id: z.string(),
  email: z.email(),
  role: roleSchema,
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  avatar: avatarRecipeSchema,
  avatarAssetId: z.string().optional(),
  /** Still on the site's temporary password: they haven't signed in and chosen their own yet. */
  passwordChangeRequired: z.boolean(),
  /** The account that created it in the CMS; missing for sign-ups and the seeded dev account. */
  createdBy: z.string().optional(),
  createdAt: z.iso.datetime(),
});

/** `GET /api/users`: a page of accounts, newest first, optionally searched (name or email) and filtered by role. */
export const userListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  q: z.string().trim().max(100).optional(),
  role: roleSchema.optional(),
});

export const userListResponseSchema = z.object({
  users: managedUserSchema.array(),
  total: z.number().int(),
  page: z.number().int(),
  pageSize: z.number().int(),
});

/** What the Users screen needs to know about this site: whether new accounts can be given a temporary password. */
export const userManagementInfoSchema = z.object({
  /** USER_TEMP_PASSWORD is set; without it, creating accounts and resetting passwords are off. */
  tempPasswordSet: z.boolean(),
});

/** `POST /api/users`: a new account, which signs in with the site's temporary password and must then change it. */
export const createUserRequestSchema = z
  .object({
    firstName: nameSchema('Enter their first name'),
    lastName: lastNameSchema.optional(),
    email: emailSchema,
    role: roleSchema,
  })
  .strict();

/** `PATCH /api/users/:id`: their names or role. Fields left out stay as they are; an empty last name removes it. */
export const updateUserRequestSchema = z
  .object({
    firstName: nameSchema('Enter their first name'),
    lastName: lastNameSchema,
    role: roleSchema,
  })
  .partial()
  .strict();

/** `POST /api/users/delete`: one or many accounts to delete, permanently. */
export const deleteUsersRequestSchema = z
  .object({ ids: z.string().min(1).array().min(1, { error: 'Choose at least one account' }).max(100, { error: 'Delete at most 100 at a time' }) })
  .strict();

/** What a delete did: the ids deleted, and those that weren't, each with the reason. */
export const deleteUsersResponseSchema = z.object({
  deleted: z.string().array(),
  failed: z.object({ id: z.string(), name: z.string(), reason: z.string() }).array(),
});
