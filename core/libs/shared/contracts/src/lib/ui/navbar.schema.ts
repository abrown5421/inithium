import { z } from 'zod';
import { iconNameSchema } from './icon.schema';

/** A link in a Navbar (decision 0076): a page it goes to. */
export const navLinkSchema = z
  .object({
    label: z.string().min(1),
    /** Where it goes, e.g. '/calendar'. */
    href: z.string().min(1),
    /** A Lucide icon before the label. */
    icon: iconNameSchema.optional(),
  })
  .strict();

/** A group of links under a heading: a dropdown on wide screens, an indented list in the drawer. Not a link itself. */
export const navGroupSchema = z
  .object({
    label: z.string().min(1),
    icon: iconNameSchema.optional(),
    children: z.array(navLinkSchema).min(1),
  })
  .strict();

/** A Navbar entry: a link, or a group of links one level deep. */
export const navItemSchema = z.union([navLinkSchema, navGroupSchema]);

/** Where a Navbar's page links sit between the logo and the right-hand sections. */
export const navbarLinksAligns = ['start', 'center', 'end'] as const;
export const navbarLinksAlignSchema = z.enum(navbarLinksAligns);

/** A Navbar's logo image: a URL for now; an asset id once assets are built (decision 0076). */
export const navbarLogoSchema = z
  .object({
    src: z.string().min(1),
    alt: z.string(),
  })
  .strict();

export type NavLink = z.infer<typeof navLinkSchema>;
export type NavGroup = z.infer<typeof navGroupSchema>;
export type NavItem = z.infer<typeof navItemSchema>;
export type NavbarLinksAlign = z.infer<typeof navbarLinksAlignSchema>;
export type NavbarLogo = z.infer<typeof navbarLogoSchema>;
