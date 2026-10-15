import { Router, type Request, type Response } from 'express';
import { pageCreateSchema, pageDraftSaveSchema, pageDuplicateSchema, pageUpdateSchema, type SiteBundle } from '@inithium/shared-contracts';
import { hasPermission } from '@inithium/shared-permissions';
import { getAuth, requirePermission } from '@inithium/api-auth';
import { listFontFamilies, toSiteFontFamily } from '@inithium/api-fonts';
import { getSiteSettings, toSiteSettings } from '@inithium/api-settings';
import type { PageDocument } from './pages.model';
import {
  createPage,
  deletePage,
  discardContentDraft,
  duplicatePage,
  findPageById,
  listPages,
  listPublishedPages,
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

/** Saves a content page's draft (decision 0093); the CMS editor autosaves through it. */
pagesRouter.put('/:id/content', ...requirePermission('pages.edit'), async (req, res) => {
  const parsed = pageDraftSaveSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).send({ message: 'Some blocks have problems', issues: parsed.error.issues });
    return;
  }
  const page = await findPageById(pageId(req));
  if (!page) return void notFound(res);
  res.send(toPage(await saveContentDraft(page, parsed.data.draft, getAuth(res).sub)));
});

/** Publishes a content page's draft, and the page itself if it wasn't live. */
pagesRouter.post('/:id/content/publish', ...requirePermission('pages.publish'), async (req, res) => {
  const page = await findPageById(pageId(req));
  if (!page) return void notFound(res);
  res.send(toPage(await publishContent(page, getAuth(res).sub)));
});

/** Throws away a content page's unpublished changes. */
pagesRouter.post('/:id/content/discard', ...requirePermission('pages.edit'), async (req, res) => {
  const page = await findPageById(pageId(req));
  if (!page) return void notFound(res);
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
