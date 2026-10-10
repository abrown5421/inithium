import { z } from 'zod';
import { navbarLogoSchema } from '../ui/navbar.schema';
import { publicPageSchema } from '../pages/pages.schema';

/** The site-wide settings the CMS edits (decision 0082). */
export const siteSettingsInputSchema = z
  .object({
    /** The site's name: the Navbar title and the end of every document title. */
    siteTitle: z.string().min(1).max(100),
    /** The Navbar logo: a URL until assets exist. */
    logo: navbarLogoSchema.optional(),
    /** The copyright holder in the Footer. */
    copyright: z.string().min(1).max(100).optional(),
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
