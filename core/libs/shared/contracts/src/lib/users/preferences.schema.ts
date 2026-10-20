import { z } from 'zod';

/**
 * How a user wants the site drawn (decision 0119): following their device's setting, or always light or dark. Dark mode
 * mirrors the theme's scales; the site can switch it off for everyone (site settings' `darkMode`).
 */
export const colorSchemes = ['system', 'light', 'dark'] as const;

export const colorSchemeSchema = z.enum(colorSchemes);

/**
 * A user's private preferences (decision 0119), kept apart from their public profile. Only they see them, through
 * `GET /api/auth/me`.
 */
export const userPreferencesSchema = z
  .object({
    colorScheme: colorSchemeSchema,
  })
  .strict();

/** `PATCH /api/profiles/me/preferences`: the preferences to change. Fields left out stay as they are. */
export const updatePreferencesRequestSchema = userPreferencesSchema.partial().strict();

/** The preferences an account starts with, and that older accounts read as. */
export const DEFAULT_USER_PREFERENCES = { colorScheme: 'system' } as const satisfies z.infer<typeof userPreferencesSchema>;
