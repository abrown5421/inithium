import { z } from 'zod';
import { avatarRecipeSchema } from '../ui/avatar.schema';
import { polyPatternSchema } from '../ui/poly-pattern.schema';

/** Every role a user can hold, from most to least privileged. */
export const roles = ['dev', 'owner', 'admin', 'editor', 'user'] as const;

export const roleSchema = z.enum(roles);

/** The limits of a profile's text fields. */
export const profileLimits = { name: 50, bio: 280 } as const;

/**
 * Profile data, kept apart from authentication fields (decisions 0074, 0083, 0090). Every account has an avatar and
 * a banner recipe from the moment it's created; names are missing on accounts created without them (e.g. the
 * seeded dev account) until their owner adds them.
 */
export const userProfileSchema = z
  .object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    bio: z.string().optional(),
    avatar: avatarRecipeSchema,
    banner: polyPatternSchema,
  })
  .strict();

/** A user as the API returns it. Never includes credentials. */
export const userSchema = z.object({
  id: z.string(),
  email: z.email(),
  role: roleSchema,
  passwordChangeRequired: z.boolean(),
  profile: userProfileSchema,
  createdAt: z.iso.datetime(),
});

type Named = { firstName?: string; lastName?: string };

/** A profile's first and last name, or undefined when it has none. */
export function profileName(profile: Named): string | undefined {
  return [profile.firstName, profile.lastName].filter(Boolean).join(' ') || undefined;
}

/** The name to show a user for themselves: their first and last name, or their email when they have none. */
export function userDisplayName(user: { email: string; profile?: Named }): string {
  return (user.profile && profileName(user.profile)) ?? user.email;
}
