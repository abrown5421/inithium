import { z } from 'zod';

/** The theme's two font roles (decision 0046): `display` for branding and headings, `body` for everything else. */
export const fontRoles = ['display', 'body'] as const;

/**
 * A font family (decision 0112): a theme role, or a family from the font library by its id. Prefer the roles: they
 * follow a re-brand, while a library family stays that family. A family that no longer exists draws as `body`.
 */
export const fontFamilySchema = z.union([
  z.enum(fontRoles),
  z.object({ familyId: z.string().regex(/^[a-f0-9]{24}$/i, { error: 'Not a font family' }) }).strict(),
]);

export const fontWeightSchema = z.literal([100, 200, 300, 400, 500, 600, 700, 800, 900]);

export const textAlignSchema = z.enum(['left', 'center', 'right', 'justify', 'start', 'end']);

export const fontStyleSchema = z.enum(['normal', 'italic']);

export const textDecorationSchema = z.enum(['none', 'underline', 'line-through']);

/** Number of lines to show before an ellipsis (1 = single line), or false for no truncation. */
export const truncateSchema = z.union([z.number().int().min(1), z.literal(false)]);
