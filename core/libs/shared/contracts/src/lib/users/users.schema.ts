import { z } from 'zod';
import { assetUrl } from '../assets/assets.schema';
import { restrictedRichTextSchema, richTextDocumentSchema, type RichTextFeature } from '../content/rich-text.schema';
import { avatarRecipeSchema } from '../ui/avatar.schema';
import { polyPatternSchema } from '../ui/poly-pattern.schema';

/** Every role a user can hold, from most to least privileged. */
export const roles = ['dev', 'owner', 'admin', 'editor', 'user'] as const;

export const roleSchema = z.enum(roles);

/** The limits of a profile's text fields. */
export const profileLimits = { name: 50, bio: 280 } as const;

/** What a bio's rich text may use (decision 0102): bold, italic and links to web addresses, with line breaks. */
export const bioFeatures: readonly RichTextFeature[] = ['bold', 'italic', 'link'];

/** A bio as it's saved: rich text with only the bio's features, at most 280 characters. */
export const bioSchema = restrictedRichTextSchema({ features: bioFeatures, maxLength: profileLimits.bio, urlLinksOnly: true });

/**
 * Profile data, kept apart from authentication fields (decisions 0074, 0083, 0090). Every account has an avatar and
 * a banner recipe from the moment it's created; names are missing on accounts created without them (e.g. the
 * seeded dev account) until their owner adds them.
 */
export const userProfileSchema = z
  .object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    /** Rich text (decision 0102). */
    bio: richTextDocumentSchema.optional(),
    avatar: avatarRecipeSchema,
    banner: polyPatternSchema,
    /** An uploaded picture shown instead of the generated avatar, which stays as its fallback (decision 0098). */
    avatarAssetId: z.string().optional(),
    /** An uploaded picture shown instead of the generated banner, which stays as its fallback. */
    bannerAssetId: z.string().optional(),
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

/** An uploaded profile picture as components take it (`{ src }`), or undefined without one (decision 0098). */
export function profileImage(assetId: string | undefined): { src: string } | undefined {
  return assetId ? { src: assetUrl(assetId) } : undefined;
}

/** A profile's first and last name, or undefined when it has none. */
export function profileName(profile: Named): string | undefined {
  return [profile.firstName, profile.lastName].filter(Boolean).join(' ') || undefined;
}

/** The name to show a user for themselves: their first and last name, or their email when they have none. */
export function userDisplayName(user: { email: string; profile?: Named }): string {
  return (user.profile && profileName(user.profile)) ?? user.email;
}
