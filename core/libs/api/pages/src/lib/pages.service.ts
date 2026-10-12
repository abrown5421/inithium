import { isValidObjectId } from 'mongoose';
import {
  createContentId,
  emptyContentDocument,
  navigationAllowed,
  readContentDocument,
  type NavLocation,
  type Page,
  type PageAnimation,
  type PageContent,
  type PageCreate,
  type PageDuplicate,
  type PageUpdate,
  type PublicPage,
} from '@inithium/shared-contracts';
import { PageModel, type PageDocument } from './pages.model';
import { reusableTemplates } from './reusable-templates.config';

/** An error the API's error handler sends with its status, message and (for a form) the field it's about. */
const failure = (status: number, message: string, field?: string) => Object.assign(new Error(message), { status, field });

const definedOnly = <T extends object>(value: T) =>
  Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined && entry !== null && entry !== '')) as T;

/** Maps a stored page to the shape the API returns to the CMS. */
export function toPage(doc: PageDocument): Page {
  const navigation = doc.navigation ?? { locations: [], order: 0 };
  return {
    id: doc._id.toString(),
    title: doc.title,
    path: doc.path,
    status: doc.status,
    template: doc.template,
    layout: doc.layout,
    layouts: [...doc.layouts],
    ...(doc.bgColor !== undefined && doc.bgColor !== null ? { bgColor: doc.bgColor as Page['bgColor'] } : {}),
    ...(doc.textColor !== undefined && doc.textColor !== null ? { textColor: doc.textColor as Page['textColor'] } : {}),
    ...(doc.animation ? { animation: doc.animation as PageAnimation } : {}),
    audience: doc.audience,
    navigation: definedOnly({
      locations: [...(navigation.locations ?? [])] as NavLocation[],
      label: navigation.label ?? undefined,
      order: navigation.order ?? 0,
      icon: (navigation.icon ?? undefined) as Page['navigation']['icon'],
      group: navigation.group ?? undefined,
    }),
    seo: definedOnly({ title: doc.seo?.title ?? undefined, description: doc.seo?.description ?? undefined }),
    protected: doc.protected,
    ...readPageContent(doc.content),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

/** A published page as `web` receives it. */
export function toPublicPage(doc: PageDocument): PublicPage {
  const { id, title, path, template, layout, bgColor, textColor, animation, audience, navigation, seo, content } = toPage(doc);
  return definedOnly({
    id, title, path, template, layout, bgColor, textColor, animation, audience, navigation, seo,
    // Visitors only ever get the published version of a content page (decision 0093).
    content: content?.published ?? undefined,
  });
}

/** A stored content field as `{ content }`, upgraded to the current format; nothing when there's no valid draft. */
function readPageContent(stored: unknown): { content?: PageContent } {
  const { draft, published } = (stored ?? {}) as { draft?: unknown; published?: unknown };
  const current = readContentDocument(draft);
  if (!current) return {};
  return { content: { draft: current, published: published ? (readContentDocument(published) ?? null) : null } };
}

export async function listPages(): Promise<PageDocument[]> {
  return PageModel.find().sort({ path: 1 });
}

export async function listPublishedPages(): Promise<PageDocument[]> {
  return PageModel.find({ status: 'published' }).sort({ path: 1 });
}

export async function findPageById(id: string): Promise<PageDocument | null> {
  if (!isValidObjectId(id)) return null;
  return PageModel.findById(id);
}

/**
 * Applies a validated CMS edit (decision 0078). Protected pages keep their path; the layout must be one the page's
 * template allows; pages with parameters stay out of menus (except Profile); changing status needs pages.publish.
 */
export async function updatePage(doc: PageDocument, update: PageUpdate, options: { canPublish: boolean }): Promise<PageDocument> {
  if (update.status !== undefined && update.status !== doc.status && !options.canPublish) {
    throw failure(403, 'You do not have permission to publish or unpublish pages');
  }
  if (update.path !== undefined && update.path !== doc.path && doc.protected) {
    throw failure(409, "This page's path is set by its developer and can't be changed");
  }
  if (update.layout !== undefined && !doc.layouts.includes(update.layout)) {
    throw failure(400, `This page's layout must be one of: ${doc.layouts.join(', ')}`);
  }
  const path = update.path ?? doc.path;
  const navigation = update.navigation ?? toPage(doc).navigation;
  if (!navigationAllowed({ path, template: doc.template, navigation })) {
    throw failure(400, 'Pages with parameters in their path can only appear in menus as the profile page in profile-nav');
  }

  // null clears an optional field (a colour or the animation).
  for (const [key, value] of Object.entries(update)) doc.set(key, value === null ? undefined : value);
  try {
    return await doc.save();
  } catch (error) {
    if ((error as { code?: number }).code === 11000) throw failure(409, 'Another page already uses that path');
    throw error;
  }
}

/** Deletes a page that isn't protected. */
export async function deletePage(doc: PageDocument): Promise<void> {
  if (doc.protected) throw failure(409, "This page is part of the site and can't be deleted. Unpublish it instead");
  await doc.deleteOne();
}

/** Saves a new page, turning a taken path into a 409 that names the path field. */
async function saveNew(doc: PageDocument): Promise<PageDocument> {
  try {
    return await doc.save();
  } catch (error) {
    if ((error as { code?: number }).code === 11000) throw failure(409, 'Another page already uses that address', 'path');
    throw error;
  }
}

/** A content page's starting content: one empty section in the draft, nothing published. */
const startingContent = (): PageContent => ({ draft: emptyContentDocument(createContentId), published: null });

/**
 * Creates a page from a reusable template (decision 0093). It starts unpublished, out of menus and unprotected;
 * content pages start with one empty section. The layout defaults to the template's first.
 */
export async function createPage(input: PageCreate): Promise<PageDocument> {
  const template = reusableTemplates.find((candidate) => candidate.key === input.template);
  if (!template) throw failure(400, 'Choose one of the templates offered', 'template');
  const layout = input.layout ?? template.layouts[0];
  if (!template.layouts.includes(layout)) throw failure(400, `Choose one of: ${template.layouts.join(', ')}`, 'layout');

  return saveNew(
    new PageModel({
      title: input.title,
      path: input.path,
      status: 'unpublished',
      template: template.key,
      layout,
      layouts: [...template.layouts],
      audience: 'all',
      navigation: { locations: [], order: 0 },
      seo: {},
      protected: false,
      ...(template.content ? { content: startingContent() } : {}),
    }),
  );
}

/**
 * Copies a page made from a reusable template under a new title and path (decision 0093): its look, audience, SEO
 * and draft content, but unpublished, out of menus, unprotected and with nothing published yet.
 */
export async function duplicatePage(source: PageDocument, input: PageDuplicate): Promise<PageDocument> {
  if (!reusableTemplates.some((template) => template.key === source.template)) {
    throw failure(409, "This page is drawn by its own code, so it can't be duplicated");
  }
  const page = toPage(source);
  return saveNew(
    new PageModel({
      title: input.title,
      path: input.path,
      status: 'unpublished',
      template: page.template,
      layout: page.layout,
      layouts: page.layouts,
      ...(page.bgColor ? { bgColor: page.bgColor } : {}),
      ...(page.textColor ? { textColor: page.textColor } : {}),
      ...(page.animation ? { animation: page.animation } : {}),
      audience: page.audience,
      navigation: { locations: [], order: 0 },
      seo: page.seo,
      protected: false,
      ...(page.content ? { content: { draft: page.content.draft, published: null } } : {}),
    }),
  );
}
