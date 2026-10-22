import { describe, expect, it, vi } from 'vitest';
import { expectSeedIsIdempotent } from '@inithium/api-testing';
import { createTestApiWithAuth, signedInClient } from '@inithium/api-testing-accounts';
import type { TestClient } from '@inithium/api-testing';
import { createContentId, richTextFromPlainText, type ContentDocument } from '@inithium/shared-contracts';
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

/** A page builder session on a page: it takes the edit lock, then saves, publishes and discards holding it. */
async function builder(client: TestClient, id: string, lockId = `lock-${createContentId()}`) {
  const lock = await client.post(`/api/pages/${id}/content/lock`, { lockId });
  const headers = { 'x-content-lock': lockId };
  return {
    lockId,
    lock,
    save: (draft: ContentDocument) => client.request('PUT', `/api/pages/${id}/content`, { draft }, headers),
    publish: () => client.request('POST', `/api/pages/${id}/content/publish`, undefined, headers),
    discard: () => client.request('POST', `/api/pages/${id}/content/discard`, undefined, headers),
  };
}

const withHeading = (text: string): ContentDocument => ({
  schemaVersion: 2,
  elements: [{ id: createContentId(), type: 'text', props: { doc: richTextFromPlainText(text) } }],
});

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

    const session = await builder(client, page.id);
    await session.save(withHeading('First'));
    await session.publish();
    await session.save(withHeading('Second, unpublished'));

    const site = await client.get('/api/site');
    const news = site.body.pages.find((p: { path: string }) => p.path === '/news');
    expect(JSON.stringify(news.content)).toContain('First');
    expect(JSON.stringify(site.body)).not.toContain('Second, unpublished');
  });

  it('discarding puts the draft back to what’s published', async () => {
    const { client } = await signedInClient(app, 'owner');
    const page = (await client.post('/api/pages', { title: 'News', path: '/news', template: 'content' })).body;
    const session = await builder(client, page.id);
    await session.save(withHeading('Live'));
    await session.publish();
    await session.save(withHeading('Scrapped'));
    const discarded = await session.discard();
    expect(discarded.body.content.draft).toEqual(discarded.body.content.published);
  });

  it('refuses drafts that break the content contract', async () => {
    const { client } = await signedInClient(app, 'owner');
    const page = (await client.post('/api/pages', { title: 'News', path: '/news', template: 'content' })).body;
    const bad = { schemaVersion: 1, sections: [{ id: 'a', layout: 'halves', columns: [{ id: 'b', blocks: [] }] }] };
    expect((await (await builder(client, page.id)).save(bad as unknown as ContentDocument)).status).toBe(400);
  });
});

describe('where a page is linked from (decision 0116)', () => {
  it('lists content pages linking to it, published or only in their draft', async () => {
    const { client } = await signedInClient(app, 'owner');
    const target = (await client.post('/api/pages', { title: 'Prices', path: '/prices', template: 'content' })).body;
    const linking = (await client.post('/api/pages', { title: 'Home page', path: '/welcome', template: 'content' })).body;
    expect((await client.get(`/api/pages/${target.id}/usage`)).body).toEqual({ places: [] });

    const session = await builder(client, linking.id);
    await session.save({ schemaVersion: 2, elements: [{ id: 'go', type: 'button', props: { label: 'See prices', link: { type: 'page', pageId: target.id } } }] });
    expect((await client.get(`/api/pages/${target.id}/usage`)).body.places).toEqual([{ label: 'Page: Home page (unpublished changes)', blocking: false }]);
    await session.publish();
    expect((await client.get(`/api/pages/${target.id}/usage`)).body.places).toEqual([{ label: 'Page: Home page', blocking: false }]);
  });
});

describe('the page builder’s edit lock (decision 0116)', () => {
  const contentPage = async (client: TestClient) => (await client.post('/api/pages', { title: 'News', path: '/news', template: 'content' })).body as { id: string };

  it('lets one builder session hold a page, and refuses everyone else, the same person in another tab included', async () => {
    const { client: jane, account } = await signedInClient(app, 'editor');
    const { client: sam } = await signedInClient(app, 'owner');
    const page = await contentPage(jane);
    const first = await builder(jane, page.id);
    expect(first.lock.status).toBe(204);
    expect((await jane.post(`/api/pages/${page.id}/content/lock`, { lockId: first.lockId })).status).toBe(204);

    const other = await builder(sam, page.id);
    expect(other.lock.status).toBe(409);
    expect(other.lock.body).toMatchObject({ code: 'CONTENT_LOCKED', editing: { userId: account.id, name: account.email } });
    expect((await builder(jane, page.id)).lock.status).toBe(409);
    expect((await sam.get(`/api/pages/${page.id}`)).body.editing).toMatchObject({ name: account.email });
  });

  it('gives a session its lock when it asks twice at once', async () => {
    const { client: jane } = await signedInClient(app, 'editor');
    const page = await contentPage(jane);
    const lockId = `lock-${createContentId()}`;
    const answers = await Promise.all(Array.from({ length: 4 }, () => jane.post(`/api/pages/${page.id}/content/lock`, { lockId })));
    expect(answers.map((answer) => answer.status)).toEqual([204, 204, 204, 204]);
  });

  it('refuses saving, publishing and discarding without the lock', async () => {
    const { client: jane } = await signedInClient(app, 'owner');
    const { client: sam } = await signedInClient(app, 'owner');
    const page = await contentPage(jane);
    await builder(jane, page.id);
    expect((await sam.put(`/api/pages/${page.id}/content`, { draft: withHeading('Sneaky') })).status).toBe(409);
    const intruder = await builder(sam, page.id);
    expect((await intruder.save(withHeading('Sneaky'))).status).toBe(409);
    expect((await intruder.publish()).status).toBe(409);
    expect((await intruder.discard()).status).toBe(409);
  });

  it('frees the page when the session lets go', async () => {
    const { client: jane } = await signedInClient(app, 'owner');
    const { client: sam } = await signedInClient(app, 'owner');
    const page = await contentPage(jane);
    const session = await builder(jane, page.id);
    expect((await jane.post(`/api/pages/${page.id}/content/unlock`, { lockId: session.lockId })).status).toBe(204);
    expect((await jane.get(`/api/pages/${page.id}`)).body.editing).toBeUndefined();
    expect((await builder(sam, page.id)).lock.status).toBe(204);
  });

  it('lets anyone take a lock with no heartbeat for two minutes, and never a live one', async () => {
    const { client: jane } = await signedInClient(app, 'owner');
    const { client: sam } = await signedInClient(app, 'owner');
    const page = await contentPage(jane);
    const abandoned = await builder(jane, page.id);
    await PageModel.updateOne({ _id: page.id }, { $set: { 'contentLock.heartbeatAt': new Date(Date.now() - 3 * 60 * 1000) } });
    expect((await jane.get(`/api/pages/${page.id}`)).body.editing).toBeUndefined();
    const taken = await builder(sam, page.id);
    expect(taken.lock.status).toBe(204);
    // The abandoned session can't save over the one that took over.
    expect((await abandoned.save(withHeading('Late'))).status).toBe(409);
    expect((await taken.save(withHeading('Fresh'))).status).toBe(200);
  });

  it('keeps settings out of the lock', async () => {
    const { client: jane } = await signedInClient(app, 'owner');
    const { client: sam } = await signedInClient(app, 'owner');
    const page = await contentPage(jane);
    await builder(jane, page.id);
    expect((await sam.patch(`/api/pages/${page.id}`, { title: 'Latest news' })).status).toBe(200);
  });

  it('needs pages.edit to take a lock', async () => {
    const { client: owner } = await signedInClient(app, 'owner');
    const { client: member } = await signedInClient(app, 'user');
    const page = await contentPage(owner);
    expect((await member.post(`/api/pages/${page.id}/content/lock`, { lockId: 'lock-12345678' })).status).toBe(403);
    expect((await owner.post(`/api/pages/${page.id}/content/lock`, { lockId: 'x' })).status).toBe(400);
  });
});
