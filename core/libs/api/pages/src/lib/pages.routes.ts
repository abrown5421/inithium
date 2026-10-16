import { Router, type Request, type Response } from 'express';
import {
  CONTENT_LOCK_HEADER,
  contentLockIdSchema,
  contentLockRequestSchema,
  pageCreateSchema,
  pageDraftSaveSchema,
  pageDuplicateSchema,
  pageUpdateSchema,
  type PageEditing,
  type SiteBundle,
} from '@inithium/shared-contracts';
import { hasPermission } from '@inithium/shared-permissions';
import { getAuth, requirePermission } from '@inithium/api-auth';
import { listFontFamilies, toSiteFontFamily } from '@inithium/api-fonts';
import { getSiteSettings, toSiteSettings } from '@inithium/api-settings';
import { checkContentLock, releaseContentLock, takeContentLock } from './content-lock.service';
import type { PageDocument } from './pages.model';
import {
  createPage,
  deletePage,
  discardContentDraft,
  duplicatePage,
  findPageById,
  listPages,
  listPublishedPages,
  pageUsage,
  publishContent,
  saveContentDraft,
  toPage,
  toPublicPage,
  updatePage,
} from './pages.service';
import { listReusableTemplates } from './reusable-templates.config';

const notFound = (res: Response) => res.status(404).send({ message: 'Page not found' });
/** The :id route parameter. */
const pageId = (req: Request) => String(req.params['id']);

/** Mounted at /api/pages: the CMS lists, creates, edits and deletes page records (decisions 0078, 0093). */
export const pagesRouter = Router();

pagesRouter.get('/', ...requirePermission('pages.edit'), async (_req, res) => {
  res.send((await listPages()).map(toPage));
});

/** The reusable templates new pages can be made from (decision 0093). */
pagesRouter.get('/templates', ...requirePermission('pages.create'), (_req, res) => {
  res.send(listReusableTemplates());
});

/** Creates an unpublished page from a reusable template. */
pagesRouter.post('/', ...requirePermission('pages.create'), async (req, res) => {
  const parsed = pageCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).send({ message: 'Check the highlighted fields and try again', issues: parsed.error.issues });
    return;
  }
  res.status(201).send(toPage(await createPage(parsed.data)));
});

/** Copies a page made from a reusable template under a new title and path. */
pagesRouter.post('/:id/duplicate', ...requirePermission('pages.create'), async (req, res) => {
  const parsed = pageDuplicateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).send({ message: 'Check the highlighted fields and try again', issues: parsed.error.issues });
    return;
  }
  const page = await findPageById(pageId(req));
  if (!page) return void notFound(res);
  res.status(201).send(toPage(await duplicatePage(page, parsed.data)));
});

pagesRouter.get('/:id', ...requirePermission('pages.edit'), async (req, res) => {
  const page = await findPageById(pageId(req));
  if (!page) return void notFound(res);
  res.send(toPage(page));
});

/** Where a page is linked from (decision 0116), so deleting it can warn. */
pagesRouter.get('/:id/usage', ...requirePermission('pages.edit'), async (req, res) => {
  const page = await findPageById(pageId(req));
  if (!page) return void notFound(res);
  res.send(await pageUsage(String(page._id)));
});

pagesRouter.patch('/:id', ...requirePermission('pages.edit'), async (req, res) => {
  const parsed = pageUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).send({ message: 'Check the page and try again', issues: parsed.error.issues });
    return;
  }
  const page: PageDocument | null = await findPageById(pageId(req));
  if (!page) return void notFound(res);
  const updated = await updatePage(page, parsed.data, { canPublish: hasPermission(getAuth(res).role, 'pages.publish') });
  res.send(toPage(updated));
});

/** 409: someone else has the page open in the page builder (decision 0116), or this request didn't come from it. */
function locked(res: Response, editing: PageEditing | undefined): void {
  res.status(409).send({
    message: editing ? `${editing.name} is editing this page` : 'Open the page in the page builder to change its content',
    code: 'CONTENT_LOCKED',
    ...(editing ? { editing } : {}),
  });
}

/** The page, if the request comes from the page builder session holding its lock; otherwise it answers itself. */
async function lockedPage(req: Request, res: Response): Promise<PageDocument | undefined> {
  const page = await findPageById(pageId(req));
  if (!page) return void notFound(res);
  const lockId = contentLockIdSchema.safeParse(req.get(CONTENT_LOCK_HEADER)).data;
  const lock = await checkContentLock(page, lockId, getAuth(res).sub);
  if (!lock.held) return void locked(res, lock.editing);
  return page;
}

/**
 * Takes the page's edit lock for a page builder session, or keeps it alive (decision 0116): 204, or 409 with who's
 * editing. The builder calls it when it opens a page and then every CONTENT_LOCK_HEARTBEAT_MS.
 */
pagesRouter.post('/:id/content/lock', ...requirePermission('pages.edit'), async (req, res) => {
  const parsed = contentLockRequestSchema.safeParse(req.body);
  if (!parsed.success) return void res.status(400).send({ message: 'Send a lock id' });
  const page = await findPageById(pageId(req));
  if (!page) return void notFound(res);
  const lock = await takeContentLock(page, parsed.data.lockId, getAuth(res).sub);
  if (!lock.held) return void locked(res, lock.editing);
  res.status(204).end();
});

/** Lets go of the page's edit lock, if the session holds it (also sent with sendBeacon as the builder's tab closes). */
pagesRouter.post('/:id/content/unlock', ...requirePermission('pages.edit'), async (req, res) => {
  const parsed = contentLockRequestSchema.safeParse(req.body);
  if (!parsed.success) return void res.status(400).send({ message: 'Send a lock id' });
  const page = await findPageById(pageId(req));
  if (!page) return void notFound(res);
  await releaseContentLock(page, parsed.data.lockId);
  res.status(204).end();
});

/** Saves a content page's draft (decision 0093); the page builder autosaves through it, holding the edit lock. */
pagesRouter.put('/:id/content', ...requirePermission('pages.edit'), async (req, res) => {
  const parsed = pageDraftSaveSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).send({ message: 'Some elements have problems', issues: parsed.error.issues });
    return;
  }
  const page = await lockedPage(req, res);
  if (!page) return;
  res.send(toPage(await saveContentDraft(page, parsed.data.draft, getAuth(res).sub)));
});

/** Publishes a content page's draft, and the page itself if it wasn't live (holding the edit lock). */
pagesRouter.post('/:id/content/publish', ...requirePermission('pages.publish'), async (req, res) => {
  const page = await lockedPage(req, res);
  if (!page) return;
  res.send(toPage(await publishContent(page, getAuth(res).sub)));
});

/** Throws away a content page's unpublished changes (holding the edit lock). */
pagesRouter.post('/:id/content/discard', ...requirePermission('pages.edit'), async (req, res) => {
  const page = await lockedPage(req, res);
  if (!page) return;
  res.send(toPage(await discardContentDraft(page, getAuth(res).sub)));
});

pagesRouter.delete('/:id', ...requirePermission('pages.delete'), async (req, res) => {
  const page = await findPageById(pageId(req));
  if (!page) return void notFound(res);
  await deletePage(page);
  res.status(204).end();
});

/** Mounted at /api/site: what `web` loads once at startup, for everyone (decision 0079). */
export const siteRouter = Router();

siteRouter.get('/', async (_req, res) => {
  const [settings, pages, fontFamilies] = await Promise.all([getSiteSettings(), listPublishedPages(), listFontFamilies()]);
  const body: SiteBundle = { settings: toSiteSettings(settings), pages: pages.map(toPublicPage), fontFamilies: fontFamilies.map(toSiteFontFamily) };
  res.send(body);
});
