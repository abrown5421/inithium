import { z } from 'zod';

/** Every role a user can hold, from most to least privileged. */
export const roles = ['dev', 'owner', 'admin', 'editor', 'user'] as const;

export const roleSchema = z.enum(roles);

/** Profile data, kept apart from authentication fields (decisions 0074, 0083). Grows as profiles are built. */
export const userProfileSchema = z
  .object({
    firstName: z.string(),
    lastName: z.string().optional(),
  })
  .strict();

/** A user as the API returns it. Never includes credentials. */
export const userSchema = z.object({
  id: z.string(),
  email: z.email(),
  role: roleSchema,
  passwordChangeRequired: z.boolean(),
  /** Missing on accounts created without one, e.g. the seeded dev account. */
  profile: userProfileSchema.optional(),
  createdAt: z.iso.datetime(),
});

/** The name to show for a user: their first and last name, or their email when they have no profile. */
export function userDisplayName(user: { email: string; profile?: { firstName: string; lastName?: string } }): string {
  if (!user.profile) return user.email;
  return [user.profile.firstName, user.profile.lastName].filter(Boolean).join(' ');
}
