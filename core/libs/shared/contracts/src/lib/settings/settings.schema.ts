import { z } from 'zod';
import { navbarLogoSchema } from '../ui/navbar.schema';
import { publicPageSchema } from '../pages/pages.schema';
import { themeConfigSchema } from '../ui/theme.schema';

/** The site-wide settings the CMS edits (decision 0082). */
export const siteSettingsInputSchema = z
  .object({
    /** The site's name: the Navbar title and the end of every document title. */
    siteTitle: z.string().trim().min(1, { error: "Enter the site's title" }).max(100, { error: 'Use 100 characters or fewer' }),
    /** The Navbar logo: a URL until assets exist. */
    logo: navbarLogoSchema.optional(),
    /** The copyright holder in the Footer. */
    copyright: z.string().min(1).max(100).optional(),
    /** The theme's colours (decision 0087): five brand 500s and the surface 100, as hex. Leave it out for Inithium's defaults. */
    theme: themeConfigSchema.optional(),
  })
  .strict();

/** Site settings as the API returns them. */
export const siteSettingsSchema = siteSettingsInputSchema.extend({ updatedAt: z.iso.datetime() }).strict();

/** What `web` loads once at startup (decision 0079): the settings and every published page. */
export const siteBundleSchema = z
  .object({
    settings: siteSettingsSchema,
    pages: z.array(publicPageSchema),
  })
  .strict();
