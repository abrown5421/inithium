import { z } from 'zod';

/** Every role a user can hold, from most to least privileged. */
export const roles = ['dev', 'owner', 'admin', 'editor', 'user'] as const;

export const roleSchema = z.enum(roles);

/** A user as the API returns it. Never includes credentials. */
export const userSchema = z.object({
  id: z.string(),
  email: z.email(),
  role: roleSchema,
  passwordChangeRequired: z.boolean(),
  createdAt: z.iso.datetime(),
});
