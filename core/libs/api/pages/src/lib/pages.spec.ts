import { describe, expect, it, vi } from 'vitest';
import { expectSeedIsIdempotent } from '@inithium/api-testing';
import { createTestApiWithAuth, signedInClient } from '@inithium/api-testing-accounts';
import { emptyContentDocumentV1, createContentId, type ContentDocumentV1 } from '@inithium/shared-contracts';
import { PageModel } from './pages.model';
import { pagesRouter, siteRouter } from './pages.routes';
import { corePageSeeds, seedCorePages, seedPages } from './pages.seed';

const app = createTestApiWithAuth((api) => {
  api.use('/pages', pagesRouter);
  api.use('/site', siteRouter);
});

const quietly = async <T>(work: () => Promise<T>) => {
  const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  try {
    return await work();
  } finally {
    log.mockRestore();
    warn.mockRestore();
  }
};

const withHeading = (text: string): ContentDocumentV1 => {
  const doc = emptyContentDocumentV1(createContentId);
  doc.sections[0]?.columns[0]?.blocks.push({ id: createContentId(), type: 'heading', level: 2, text });
  return doc;
};

describe('core page seeds (decisions 0078, 0097)', () => {
  it('create every core page, published and protected, and change nothing when run again', async () => {
    const created = await quietly(() => expectSeedIsIdempotent(seedCorePages));
    expect(created).toEqual([expect.objectContaining({ collection: 'pages', added: expect.any(Array) })]);
    expect(created[0]?.added).toHaveLength(corePageSeeds.length);
    const pages = await PageModel.find();
    expect(pages.every((page) => page.protected && page.status === 'published')).toBe(true);
    expect((await PageModel.findOne({ seedKey: 'privacy-policy' }))?.content).toMatchObject({ draft: expect.any(Object), published: expect.any(Object) });
  });

  it('never take over an address another page already uses', async () => {
    await PageModel.create({ title: 'Mine', path: '/login', template: 'content', layout: 'default', layouts: ['default'] });
    await quietly(seedCorePages);
    expect(await PageModel.exists({ template: 'login' })).toBeNull();
    expect((await PageModel.findOne({ path: '/login' }))?.title).toBe('Mine');
  });

  it('bring code-owned fields up to date but never CMS edits', async () => {
    await quietly(seedCorePages);
    await PageModel.updateOne({ template: 'home' }, { title: 'Welcome', layouts: ['bare'], layout: 'bare' });
    await quietly(() => seedPages(corePageSeeds));
    const home = await PageModel.findOne({ template: 'home' });
    expect(home?.title).toBe('Welcome');
    expect([...(home?.layouts ?? [])]).toEqual(['default']);
    expect(home?.layout).toBe('default');
  });

  it('write a content page’s blocks only when they create it', async () => {
    await quietly(seedCorePages);
    const edited = withHeading('Our own policy');
    await PageModel.updateOne({ seedKey: 'privacy-policy' }, { 'content.draft': edited });
    await quietly(seedCorePages);
    expect((await PageModel.findOne({ seedKey: 'privacy-policy' }).lean())?.content?.draft).toEqual(edited);
  });
});

describe('the CMS’s page rules', () => {
  it('lets editors create and edit, but not publish or delete', async () => {
    const { client } = await signedInClient(app, 'editor');
    const created = await client.post('/api/pages', { title: 'About', path: '/about', template: 'content' });
    expect(created.status).toBe(201);
    expect(created.body).toMatchObject({ status: 'unpublished', protected: false, navigation: { locations: [] } });

    expect((await client.patch(`/api/pages/${created.body.id}`, { title: 'About us' })).status).toBe(200);
    expect((await client.patch(`/api/pages/${created.body.id}`, { status: 'published' })).status).toBe(403);
    expect((await client.post(`/api/pages/${created.body.id}/content/publish`)).status).toBe(403);
    expect((await client.delete(`/api/pages/${created.body.id}`)).status).toBe(403);
  });

  it('refuses a taken path with the field named', async () => {
    const { client } = await signedInClient(app, 'admin');
    await client.post('/api/pages', { title: 'About', path: '/about', template: 'content' });
    expect(await client.post('/api/pages', { title: 'Again', path: '/about', template: 'content' })).toMatchObject({ status: 409, body: { field: 'path' } });
  });

  it('protects seeded pages: no deleting, moving or duplicating code-drawn ones', async () => {
    await quietly(seedCorePages);
    const { client } = await signedInClient(app, 'owner');
    const login = await PageModel.findOne({ template: 'login' });
    expect((await client.delete(`/api/pages/${login?.id}`)).status).toBe(409);
    expect((await client.patch(`/api/pages/${login?.id}`, { path: '/sign-in' })).status).toBe(409);
    expect((await client.post(`/api/pages/${login?.id}/duplicate`, { title: 'Copy', path: '/copy' })).status).toBe(409);
  });

  it('keeps parameterised pages out of menus', async () => {
    await quietly(seedCorePages);
    const { client } = await signedInClient(app, 'owner');
    const profile = await PageModel.findOne({ template: 'profile' });
    const response = await client.patch(`/api/pages/${profile?.id}`, { navigation: { locations: ['primary-nav'], order: 0 } });
    expect(response.status).toBe(400);
  });
});

describe('content and what visitors get (decision 0093)', () => {
  it('shows visitors only published pages and only published content', async () => {
    const { client } = await signedInClient(app, 'owner');
    const page = (await client.post('/api/pages', { title: 'News', path: '/news', template: 'content' })).body;
    expect((await client.get('/api/site')).body.pages.map((p: { path: string }) => p.path)).not.toContain('/news');

    await client.put(`/api/pages/${page.id}/content`, { draft: withHeading('First') });
    await client.post(`/api/pages/${page.id}/content/publish`);
    await client.put(`/api/pages/${page.id}/content`, { draft: withHeading('Second, unpublished') });

    const site = await client.get('/api/site');
    const news = site.body.pages.find((p: { path: string }) => p.path === '/news');
    expect(JSON.stringify(news.content)).toContain('First');
    expect(JSON.stringify(site.body)).not.toContain('Second, unpublished');
  });

  it('discarding puts the draft back to what’s published', async () => {
    const { client } = await signedInClient(app, 'owner');
    const page = (await client.post('/api/pages', { title: 'News', path: '/news', template: 'content' })).body;
    await client.put(`/api/pages/${page.id}/content`, { draft: withHeading('Live') });
    await client.post(`/api/pages/${page.id}/content/publish`);
    await client.put(`/api/pages/${page.id}/content`, { draft: withHeading('Scrapped') });
    const discarded = await client.post(`/api/pages/${page.id}/content/discard`);
    expect(discarded.body.content.draft).toEqual(discarded.body.content.published);
  });

  it('refuses drafts that break the content contract', async () => {
    const { client } = await signedInClient(app, 'owner');
    const page = (await client.post('/api/pages', { title: 'News', path: '/news', template: 'content' })).body;
    const bad = { schemaVersion: 1, sections: [{ id: 'a', layout: 'halves', columns: [{ id: 'b', blocks: [] }] }] };
    expect((await client.put(`/api/pages/${page.id}/content`, { draft: bad })).status).toBe(400);
  });
});
