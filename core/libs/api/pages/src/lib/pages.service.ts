import { isValidObjectId } from 'mongoose';
import {
  navigationAllowed,
  type NavLocation,
  type Page,
  type PageAnimation,
  type PageUpdate,
  type PublicPage,
} from '@inithium/shared-contracts';
import { PageModel, type PageDocument } from './pages.model';

/** An error the API's error handler sends with its status and message. */
const failure = (status: number, message: string) => Object.assign(new Error(message), { status });

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
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

/** A published page as `web` receives it. */
export function toPublicPage(doc: PageDocument): PublicPage {
  const { id, title, path, template, layout, bgColor, textColor, animation, audience, navigation, seo } = toPage(doc);
  return definedOnly({ id, title, path, template, layout, bgColor, textColor, animation, audience, navigation, seo });
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

  for (const [key, value] of Object.entries(update)) doc.set(key, value);
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
