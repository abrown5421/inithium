import { z } from 'zod';
import { entranceAnimationSchema, exitAnimationSchema } from '../ui/animation.schema';
import { colorValueSchema } from '../ui/colors.schema';
import { iconNameSchema } from '../ui/icon.schema';
import { contentDocumentSchema, pageContentSchema } from '../content/content.schema';

/** Whether a page is live on the site (decision 0078). */
export const pageStatuses = ['published', 'unpublished'] as const;

/** Who may view a page (decision 0079). */
export const pageAudiences = ['all', 'signed-out', 'signed-in'] as const;

/** The menus a page can appear in (decision 0080). */
export const navLocations = ['primary-nav', 'profile-nav', 'primary-footer', 'secondary-footer'] as const;

/** Path prefixes that belong to the API and the CMS, never to a page. */
export const reservedPathPrefixes = ['/api', '/cms'] as const;

export const pageStatusSchema = z.enum(pageStatuses);
export const pageAudienceSchema = z.enum(pageAudiences);
export const navLocationSchema = z.enum(navLocations);

/** A lowercase kebab-case key, e.g. a template ('classes-list') or a layout ('full-width'). */
export const kebabKeySchema = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Use lowercase words joined by hyphens');

const PATH_SEGMENT = '(?:[a-z0-9]+(?:-[a-z0-9]+)*|:[a-zA-Z][a-zA-Z0-9]*)';

/** A page's address: '/' or lowercase kebab segments, with ':name' parameters, e.g. '/events/:slug'. */
export const pagePathSchema = z
  .string()
  .regex(new RegExp(`^(?:/|(?:/${PATH_SEGMENT})+)$`), "Use '/', or segments like '/about' or '/events/:slug'")
  .refine(
    (path) => !reservedPathPrefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`)),
    'Paths under /api and /cms are reserved',
  );

/** Whether a path has ':name' parameters. */
export const pathHasParams = (path: string) => path.split('/').some((segment) => segment.startsWith(':'));

/** Where a page appears in menus, and how (decision 0080). */
export const pageNavigationSchema = z
  .object({
    /** The menus it appears in; none keeps it out of menus. */
    locations: z.array(navLocationSchema).refine((list) => new Set(list).size === list.length, 'List each menu once'),
    /** The link's text. Default: the page's title. */
    label: z.string().min(1, { error: 'Enter a label, or leave it out' }).max(60, { error: 'Use 60 characters or fewer' }).optional(),
    /** Its position; lower comes first. */
    order: z.number({ error: 'Enter a whole number' }).int({ error: 'Enter a whole number' }),
    icon: iconNameSchema.optional(),
    /** Primary-nav pages sharing a group form one dropdown. */
    group: z.string().min(1, { error: 'Enter a group, or leave it out' }).max(60, { error: 'Use 60 characters or fewer' }).optional(),
  })
  .strict();

export const pageSeoSchema = z
  .object({
    /** The document title. Default: the page's title. */
    title: z.string().min(1).max(70, { error: 'Keep the search title to 70 characters or fewer' }).optional(),
    description: z.string().min(1).max(160, { error: 'Keep the description to 160 characters or fewer' }).optional(),
  })
  .strict();

/** A page's entrance and exit as it's navigated to and from. Default: a fast fadeIn and fadeOut. */
export const pageAnimationSchema = z
  .object({
    entrance: entranceAnimationSchema.optional(),
    exit: exitAnimationSchema.optional(),
  })
  .strict();

/** The fields the CMS edits on any page (decision 0078). */
const editableFields = {
  title: z.string().trim().min(1, { error: 'Enter a title' }).max(100, { error: 'Use 100 characters or fewer' }),
  status: pageStatusSchema,
  /** One of the page's `layouts`. */
  layout: kebabKeySchema,
  /** Default surface 50. */
  bgColor: colorValueSchema.optional(),
  /** Default surface 950. */
  textColor: colorValueSchema.optional(),
  animation: pageAnimationSchema.optional(),
  audience: pageAudienceSchema,
  navigation: pageNavigationSchema,
  seo: pageSeoSchema,
};

// --- The page builder's edit lock (decision 0116): one editor per page's content at a time ---

/** How long a lock lasts without a heartbeat before anyone else may take it, in ms. */
export const CONTENT_LOCK_TTL_MS = 2 * 60 * 1000;
/** How often the page builder keeps its lock alive, in ms. */
export const CONTENT_LOCK_HEARTBEAT_MS = 30 * 1000;
/** The header that carries the builder's lock id on saves, publishes and discards. */
export const CONTENT_LOCK_HEADER = 'x-content-lock';

/** A lock id: random, made by the builder for each time it opens a page. */
export const contentLockIdSchema = z.string().regex(/^[a-zA-Z0-9-]{8,64}$/, { error: 'Not a lock id' });

/** `POST /api/pages/:id/content/lock` and `/unlock`. */
export const contentLockRequestSchema = z.object({ lockId: contentLockIdSchema }).strict();

/** Who's editing a page's content, and since when. */
export const pageEditingSchema = z.object({ userId: z.string(), name: z.string(), since: z.iso.datetime() }).strict();

/** Where a page is linked from (decision 0116): other content pages' links, which only warn before it's deleted. */
export const pageUsageSchema = z
  .object({ places: z.array(z.object({ label: z.string(), blocking: z.boolean() }).strict()) })
  .strict();

/** A page record as the API returns it to the CMS. */
export const pageSchema = z
  .object({
    id: z.string(),
    ...editableFields,
    path: pagePathSchema,
    /** The code template that draws it. */
    template: kebabKeySchema,
    /** The layouts its template allows; the first is the default. */
    layouts: z.array(kebabKeySchema).min(1),
    /** Seeded pages: can't be deleted, and their path, template and layouts are fixed. */
    protected: z.boolean(),
    /** Content pages' blocks (decision 0093): the working draft and the published version. Other templates have none. */
    content: pageContentSchema.optional(),
    /** Who has its content open in the page builder right now, if anyone (decision 0116's edit lock). */
    editing: pageEditingSchema.optional(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .strict();

/** A published page as `web` receives it: no CMS-only fields. */
export const publicPageSchema = pageSchema
  .omit({ status: true, layouts: true, protected: true, content: true, editing: true, createdAt: true, updatedAt: true })
  .extend({
    /** A content page's published blocks (decision 0093); never its draft. */
    content: contentDocumentSchema.optional(),
  });

/**
 * A CMS edit: any editable field, plus the path on pages that aren't protected. Changing status needs pages.publish.
 * `null` clears a colour or the animation, so the page falls back to its template's or the site's default.
 */
export const pageUpdateSchema = z
  .object({
    ...editableFields,
    bgColor: colorValueSchema.nullable(),
    textColor: colorValueSchema.nullable(),
    animation: pageAnimationSchema.nullable(),
    path: pagePathSchema,
  })
  .partial()
  .strict();

/**
 * Pages with parameters stay out of menus, except Profile in profile-nav, which links to the signed-in user's own
 * profile (decision 0080).
 */
export function navigationAllowed(page: { path: string; template: string; navigation: { locations: readonly string[] } }) {
  const { locations } = page.navigation;
  if (!pathHasParams(page.path) || locations.length === 0) return true;
  return page.template === 'profile' && locations.every((location) => location === 'profile-nav');
}

/** A reusable template the CMS can create pages from (decision 0093), as `GET /api/pages/templates` lists it. */
export const reusableTemplateSchema = z
  .object({
    key: kebabKeySchema,
    label: z.string().min(1),
    description: z.string(),
    /** The layouts its pages may use; the first is the default. */
    layouts: z.array(kebabKeySchema).min(1),
  })
  .strict();

/** A new page's address: like any page's, but without ':name' parameters. */
const newPagePathSchema = pagePathSchema.refine((path) => !pathHasParams(path), {
  error: 'New pages can’t have parameters in their address',
});

/**
 * `POST /api/pages`: a new page from a reusable template (decision 0093). It starts unpublished and out of menus;
 * content pages start with one empty section. The layout defaults to the template's first.
 */
export const pageCreateSchema = z
  .object({
    title: editableFields.title,
    path: newPagePathSchema,
    template: kebabKeySchema,
    layout: kebabKeySchema.optional(),
  })
  .strict();

/** `POST /api/pages/:id/duplicate`: a copy of a page made from a reusable template, under a new title and path. */
export const pageDuplicateSchema = z
  .object({
    title: editableFields.title,
    path: newPagePathSchema,
  })
  .strict();

/** A path suggested from a title, e.g. 'About Us!' → '/about-us'. */
export function pathFromTitle(title: string): string {
  const slug = title
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/, '');
  return slug ? `/${slug}` : '/';
}

