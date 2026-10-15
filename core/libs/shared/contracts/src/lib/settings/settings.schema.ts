import { z } from 'zod';
import { assetUrl } from '../assets/assets.schema';
import { siteFontFamilySchema, themeFontsSchema } from '../fonts/fonts.schema';
import { publicPageSchema } from '../pages/pages.schema';
import { themeConfigSchema } from '../ui/theme.schema';

/** The site's logo (decisions 0082, 0098): an uploaded image, by its asset id, and its description. */
export const siteLogoSchema = z
  .object({
    assetId: z.string().min(1, { error: 'Choose a logo' }),
    alt: z.string().trim().max(200, { error: 'Use 200 characters or fewer' }),
  })
  .strict();

/** The site's favicon (decision 0101): an uploaded ICO, PNG or SVG, by its asset id. */
export const siteFaviconSchema = z.object({ assetId: z.string().min(1, { error: 'Choose a favicon' }) }).strict();

/** The site-wide settings the CMS edits (decision 0082). */
export const siteSettingsInputSchema = z
  .object({
    /** The site's name: the Navbar title and the end of every document title. */
    siteTitle: z.string().trim().min(1, { error: "Enter the site's title" }).max(100, { error: 'Use 100 characters or fewer' }),
    /** The Navbar logo, an uploaded image. Leave it out for Inithium's default logo. */
    logo: siteLogoSchema.optional(),
    /** The browser-tab icon of `web` and the CMS. Leave it out for Inithium's default. */
    favicon: siteFaviconSchema.optional(),
    /** The copyright holder in the Footer. */
    copyright: z.string().min(1).max(100).optional(),
    /** The theme's colours (decision 0087): five brand 500s and the surface 100, as hex. Leave it out for Inithium's defaults. */
    theme: themeConfigSchema.optional(),
    /** The theme's fonts (decision 0111): the library family for `display` and `body`. Leave one out for Inithium's default. */
    fonts: themeFontsSchema.optional(),
  })
  .strict();

/** The site logo as the Navbar takes it: the image's address and description. */
export const logoImage = (logo: { assetId: string; alt: string }) => ({ src: assetUrl(logo.assetId), alt: logo.alt });

/** Site settings as the API returns them. */
export const siteSettingsSchema = siteSettingsInputSchema.extend({ updatedAt: z.iso.datetime() }).strict();

/** What `web` loads once at startup (decision 0079): the settings and every published page. */
export const siteBundleSchema = z
  .object({
    settings: siteSettingsSchema,
    pages: z.array(publicPageSchema),
    /** Every font family in the library, to declare them and draw the theme's fonts (decision 0114). */
    fontFamilies: z.array(siteFontFamilySchema),
  })
  .strict();
