import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { connectTestRealtime, listenTestApi, type TestClient, type TestServer } from '@inithium/api-testing';
import { createTestApiWithAuth, signedInClient } from '@inithium/api-testing-accounts';
import { startRealtime, stopRealtime } from '@inithium/api-realtime';
import { contentLockChannel, createContentId, pagesChannel } from '@inithium/shared-contracts';
import { PageModel } from './pages.model';
import { pagesRealtimeChannels } from './pages.channels';
import { pagesRouter } from './pages.routes';

const app = createTestApiWithAuth((api) => api.use('/pages', pagesRouter));
let server: TestServer;

beforeEach(async () => {
  server = await listenTestApi(app);
  startRealtime(server.server, { channels: pagesRealtimeChannels });
});

afterEach(async () => {
  await stopRealtime();
  await server.close();
});

const contentPage = async (client: TestClient) => (await client.post('/api/pages', { title: 'News', path: '/news', template: 'content' })).body as { id: string };
const lock = (client: TestClient, id: string, lockId = `lock-${createContentId()}`) =>
  client.post(`/api/pages/${id}/content/lock`, { lockId }).then((response) => ({ lockId, status: response.status }));
const requestEdit = (client: TestClient, id: string) => client.post(`/api/pages/${id}/content/request-edit`);

describe('who’s editing, live (decision 0122)', () => {
  it('tells everyone who can edit pages when a page is opened in the builder and let go', async () => {
    const { client: jane, account } = await signedInClient(app, 'editor');
    const { client: sam } = await signedInClient(app, 'owner');
    const page = await contentPage(jane);
    const watcher = await connectTestRealtime(server, sam);
    expect(await watcher.subscribe(pagesChannel.name())).toEqual({ ok: true });

    const session = await lock(jane, page.id);
    expect(await watcher.nextEvent()).toMatchObject({ type: 'editing.changed', payload: { pageId: page.id, editing: { userId: account.id } } });
    // A heartbeat isn't news.
    await lock(jane, page.id, session.lockId);
    await jane.post(`/api/pages/${page.id}/content/unlock`, { lockId: session.lockId });
    expect(await watcher.nextEvent()).toMatchObject({ payload: { pageId: page.id, editing: null } });
    expect(watcher.events).toHaveLength(2);
    watcher.close();
  });

  it('keeps members out of the page list channel', async () => {
    const { client: member } = await signedInClient(app, 'user');
    const realtime = await connectTestRealtime(server, member);
    expect(await realtime.subscribe(pagesChannel.name())).toMatchObject({ ok: false, code: 'FORBIDDEN' });
    realtime.close();
  });
});

describe('asking for a page someone’s editing (decision 0122)', () => {
  it('reaches the builder session holding the lock, saying who asked', async () => {
    const { client: jane } = await signedInClient(app, 'editor');
    const { client: sam, account: samAccount } = await signedInClient(app, 'owner');
    const page = await contentPage(jane);
    const session = await lock(jane, page.id);
    const holder = await connectTestRealtime(server, jane);
    expect(await holder.subscribe(contentLockChannel.name({ pageId: page.id, lockId: session.lockId }))).toEqual({ ok: true });

    expect((await requestEdit(sam, page.id)).status).toBe(204);
    expect(await holder.nextEvent()).toMatchObject({ type: 'edit.requested', payload: { from: { userId: samAccount.id, name: samAccount.email } } });
    holder.close();
  });

  it('lets only the lock’s own session listen for requests', async () => {
    const { client: jane } = await signedInClient(app, 'editor');
    const { client: sam } = await signedInClient(app, 'owner');
    const page = await contentPage(jane);
    const session = await lock(jane, page.id);
    const channel = contentLockChannel.name({ pageId: page.id, lockId: session.lockId });

    const other = await connectTestRealtime(server, sam);
    expect(await other.subscribe(channel)).toMatchObject({ ok: false, code: 'FORBIDDEN' });
    const wrongLock = await connectTestRealtime(server, jane);
    expect(await wrongLock.subscribe(contentLockChannel.name({ pageId: page.id, lockId: 'lock-guessed1' }))).toMatchObject({ ok: false, code: 'FORBIDDEN' });
    // Once the lock has gone quiet for two minutes it isn't theirs any more.
    await PageModel.updateOne({ _id: page.id }, { $set: { 'contentLock.heartbeatAt': new Date(Date.now() - 3 * 60 * 1000) } });
    expect(await wrongLock.subscribe(channel)).toMatchObject({ ok: false, code: 'FORBIDDEN' });
    other.close();
    wrongLock.close();
  });

  it('answers when there’s nobody to ask, it’s the asker’s own tab, or they asked a moment ago', async () => {
    const { client: jane } = await signedInClient(app, 'editor');
    const { client: sam } = await signedInClient(app, 'owner');
    const { client: member } = await signedInClient(app, 'user');
    const page = await contentPage(jane);

    expect((await requestEdit(sam, page.id)).body).toMatchObject({ code: 'CONTENT_UNLOCKED' });
    await lock(jane, page.id);
    expect((await requestEdit(jane, page.id)).body).toMatchObject({ code: 'CONTENT_LOCK_YOURS' });
    expect((await requestEdit(sam, page.id)).status).toBe(204);
    const again = await requestEdit(sam, page.id);
    expect(again.status).toBe(429);
    expect(Number(again.headers.get('retry-after'))).toBeGreaterThan(0);
    expect((await requestEdit(member, page.id)).status).toBe(403);
    expect((await requestEdit(sam, '000000000000000000000000')).status).toBe(404);
  });
});
