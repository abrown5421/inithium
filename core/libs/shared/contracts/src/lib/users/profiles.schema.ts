import { z } from 'zod';
import { avatarRecipeSchema } from '../ui/avatar.schema';
import { polyPatternSchema } from '../ui/poly-pattern.schema';
import { profileLimits, profileName } from './users.schema';

/** Who is looking at a profile (decision 0081): signed out, signed in as someone else, or its owner. */
export const profileViewers = ['visitor', 'member', 'owner'] as const;

export const profileViewerSchema = z.enum(profileViewers);

/**
 * A profile as `GET /api/profiles/:id` returns it (decision 0090): what anyone may see, plus the email when the
 * viewer is its owner.
 */
export const publicProfileSchema = z.object({
  id: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  bio: z.string().optional(),
  avatar: avatarRecipeSchema,
  banner: polyPatternSchema,
  /** Uploaded pictures shown instead of the generated avatar and banner (decision 0098). */
  avatarAssetId: z.string().optional(),
  bannerAssetId: z.string().optional(),
  joinedAt: z.iso.datetime(),
  /** Only for the profile's owner. */
  email: z.email().optional(),
});

/**
 * `PATCH /api/profiles/me`: the fields to change. Fields left out stay as they are; an empty last name or bio
 * removes it. The first name can be changed but not removed. `avatarAssetId` / `bannerAssetId` show one of the
 * user's own uploads (decision 0098); `null` goes back to the generated one. Either way the old upload is deleted.
 */
export const updateProfileRequestSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, { error: 'Enter your first name' })
      .max(profileLimits.name, { error: `Use ${profileLimits.name} characters or fewer` }),
    lastName: z.string().trim().max(profileLimits.name, { error: `Use ${profileLimits.name} characters or fewer` }),
    bio: z.string().trim().max(profileLimits.bio, { error: `Use ${profileLimits.bio} characters or fewer` }),
    avatar: avatarRecipeSchema,
    banner: polyPatternSchema,
    avatarAssetId: z.string().min(1).nullable(),
    bannerAssetId: z.string().min(1).nullable(),
  })
  .partial()
  .strict();

/** The name others see on a profile: its first and last name, or 'Member' when it has none (never the email). */
export function publicProfileName(profile: { firstName?: string; lastName?: string }): string {
  return profileName(profile) ?? 'Member';
}
