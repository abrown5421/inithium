import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { connectTestRealtime, listenTestApi, type TestServer } from '@inithium/api-testing';
import { createTestApiWithAuth, createTestAccount, signedInClient } from '@inithium/api-testing-accounts';
import { startRealtime, stopRealtime } from '@inithium/api-realtime';
import { definePresenceStatus, registerPresenceStatuses, userStatusChannel } from '@inithium/shared-contracts';
import { userStatusChannelServer } from './presence.channels';
import { clearUserStatus, setUserStatus, startPresence, userStatus } from './presence.service';

const app = createTestApiWithAuth(() => undefined);
let server: TestServer;
let stopPresence: () => void;

beforeEach(async () => {
  registerPresenceStatuses([
    definePresenceStatus({ key: 'plugin-classes:in-class', label: 'In a class', color: 'violet', priority: 10 }),
    definePresenceStatus({ key: 'client-games:playing', label: (game) => `Playing ${game ?? ''}`.trim(), color: 'sky', priority: 20 }),
  ]);
  server = await listenTestApi(app);
  stopPresence = startPresence();
  startRealtime(server.server, { channels: [userStatusChannelServer] });
});

afterEach(async () => {
  await stopRealtime();
  stopPresence();
  await server.close();
  registerPresenceStatuses([]);
});

/** A guest following a user's status. */
async function follow(userId: string) {
  const watcher = await connectTestRealtime(server);
  expect(await watcher.subscribe(userStatusChannel.name({ userId }))).toEqual({ ok: true });
  return watcher;
}
const nextStatus = async (watcher: Awaited<ReturnType<typeof follow>>) => (await watcher.nextEvent()).payload;

describe('core’s statuses (decision 0124)', () => {
  it('goes from away to active when the user connects, inactive when idle, and away when they leave', async () => {
    const { client, account } = await signedInClient(app, 'user');
    const watcher = await follow(account.id);
    expect(await nextStatus(watcher)).toEqual({ status: 'away' });

    const tab = await connectTestRealtime(server, client);
    expect(await nextStatus(watcher)).toEqual({ status: 'active' });
    tab.activity('idle');
    expect(await nextStatus(watcher)).toEqual({ status: 'inactive' });
    tab.close();
    expect(await nextStatus(watcher)).toEqual({ status: 'away' });
    watcher.close();
  });

  it('counts a user active while any of their tabs is', async () => {
    const { client, account } = await signedInClient(app, 'user');
    const first = await connectTestRealtime(server, client);
    const second = await connectTestRealtime(server, client);
    first.activity('idle');
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(userStatus(account.id)).toEqual({ status: 'active' });
    second.activity('idle');
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(userStatus(account.id)).toEqual({ status: 'inactive' });
    first.close();
    second.close();
  });

  it('sends a new follower the status at once', async () => {
    const { client, account } = await signedInClient(app, 'user');
    const tab = await connectTestRealtime(server, client);
    const watcher = await follow(account.id);
    expect(await nextStatus(watcher)).toEqual({ status: 'active' });
    tab.close();
    watcher.close();
  });
});

describe('plugin statuses', () => {
  it('replace active while set, the highest priority winning, and end when the user leaves', async () => {
    const { client, account } = await signedInClient(app, 'user');
    const tab = await connectTestRealtime(server, client);
    const watcher = await follow(account.id);
    expect(await nextStatus(watcher)).toEqual({ status: 'active' });

    expect(setUserStatus(account.id, 'plugin-classes:in-class')).toBe(true);
    expect(await nextStatus(watcher)).toEqual({ status: 'plugin-classes:in-class' });
    setUserStatus(account.id, 'client-games:playing', { detail: 'Trivia Night' });
    expect(await nextStatus(watcher)).toEqual({ status: 'client-games:playing', detail: 'Trivia Night' });
    clearUserStatus(account.id, 'client-games:playing');
    expect(await nextStatus(watcher)).toEqual({ status: 'plugin-classes:in-class' });

    tab.close();
    expect(await nextStatus(watcher)).toEqual({ status: 'away' });
    const back = await connectTestRealtime(server, client);
    expect(await nextStatus(watcher)).toEqual({ status: 'active' });
    back.close();
    watcher.close();
  });

  it('can’t be set on someone offline, or be one that isn’t registered', async () => {
    const account = await createTestAccount();
    expect(setUserStatus(account.id, 'plugin-classes:in-class')).toBe(false);
    expect(() => setUserStatus(account.id, 'plugin-nothing:here')).toThrow("isn't registered");
    expect(() => setUserStatus(account.id, 'active')).toThrow();
  });
});

describe('who may follow a status', () => {
  it('hides dev accounts from everyone but dev', async () => {
    const dev = await createTestAccount({ role: 'dev' });
    const guest = await connectTestRealtime(server);
    expect(await guest.subscribe(userStatusChannel.name({ userId: dev.id }))).toMatchObject({ ok: false, code: 'FORBIDDEN' });
    const { client } = await signedInClient(app, 'dev');
    const devViewer = await connectTestRealtime(server, client);
    expect(await devViewer.subscribe(userStatusChannel.name({ userId: dev.id }))).toEqual({ ok: true });
    expect(await guest.subscribe(userStatusChannel.name({ userId: '000000000000000000000000' }))).toMatchObject({ ok: false });
    guest.close();
    devViewer.close();
  });
});
