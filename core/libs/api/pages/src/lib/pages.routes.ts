import { Router, type Request, type Response } from 'express';
import { pageUpdateSchema, type SiteBundle } from '@inithium/shared-contracts';
import { hasPermission } from '@inithium/shared-permissions';
import { getAuth, requirePermission } from '@inithium/api-auth';
import { getSiteSettings, toSiteSettings } from '@inithium/api-settings';
import type { PageDocument } from './pages.model';
import { deletePage, findPageById, listPages, listPublishedPages, toPage, toPublicPage, updatePage } from './pages.service';

const notFound = (res: Response) => res.status(404).send({ message: 'Page not found' });
/** The :id route parameter. */
const pageId = (req: Request) => String(req.params['id']);

/** Mounted at /api/pages: the CMS lists, edits and deletes page records (decision 0078). */
export const pagesRouter = Router();

pagesRouter.get('/', ...requirePermission('pages.edit'), async (_req, res) => {
  res.send((await listPages()).map(toPage));
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

pagesRouter.delete('/:id', ...requirePermission('pages.delete'), async (req, res) => {
  const page = await findPageById(pageId(req));
  if (!page) return void notFound(res);
  await deletePage(page);
  res.status(204).end();
});

/** Mounted at /api/site: what `web` loads once at startup, for everyone (decision 0079). */
export const siteRouter = Router();

siteRouter.get('/', async (_req, res) => {
  const [settings, pages] = await Promise.all([getSiteSettings(), listPublishedPages()]);
  const body: SiteBundle = { settings: toSiteSettings(settings), pages: pages.map(toPublicPage) };
  res.send(body);
});
