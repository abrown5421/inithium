import { describe, expect, it } from 'vitest';
import { testClient } from '@inithium/api-testing';
import { createTestAccount, createTestApiWithAuth, signedInClient } from '@inithium/api-testing-accounts';
import { SettingsModel } from '@inithium/api-settings';
import { UserModel } from '@inithium/api-users';
import { createDashboardRouter } from './dashboards.routes';
import { deleteDashboardsOfUsers } from './dashboards.service';
import { setupChecklistItems } from './setup-checklist.service';
import type { SetupChecklistItem } from './setup-checklist.types';

const pluginItems: SetupChecklistItem[] = [
  { id: 'plugin-shop:payments', label: 'Set up payments', href: '/shop', order: 1000, isDone: async () => true },
  { id: 'plugin-shop:terms', label: 'Write your terms', order: 50 },
];
const app = createTestApiWithAuth((api) => api.use('/dashboard', createDashboardRouter({ setupChecklistItems: pluginItems })));

const widget = (id: string, type = 'member-growth') => ({ id, type, width: '1/3', settings: { range: 'month' } });

describe('/api/dashboard/me (decision 0120)', () => {
  it('needs cms.access', async () => {
    expect((await testClient(app).get('/api/dashboard/me')).status).toBe(401);
    const { client } = await signedInClient(app, 'user');
    expect((await client.get('/api/dashboard/me')).status).toBe(403);
  });

  it('starts on the default dashboard, then keeps each user’s own', async () => {
    const { client } = await signedInClient(app, 'editor');
    expect((await client.get('/api/dashboard/me')).body).toEqual({ widgets: null });
    const widgets = [widget('a'), widget('b', 'plugin-shop:orders')];
    expect((await client.put('/api/dashboard/me', { widgets })).body).toEqual({ widgets });
    expect((await client.get('/api/dashboard/me')).body).toEqual({ widgets });

    const { client: other } = await signedInClient(app, 'admin');
    expect((await other.get('/api/dashboard/me')).body).toEqual({ widgets: null });
    // Removing everything is a dashboard of its own, not the default.
    expect((await other.put('/api/dashboard/me', { widgets: [] })).body).toEqual({ widgets: [] });
  });

  it('refuses repeated ids, unknown widths, oversized settings and too many widgets', async () => {
    const { client } = await signedInClient(app, 'editor');
    const refused = async (widgets: unknown) => (await client.put('/api/dashboard/me', { widgets })).status;
    expect(await refused([widget('a'), widget('a')])).toBe(400);
    expect(await refused([{ ...widget('a'), width: '1/2' }])).toBe(400);
    expect(await refused([{ ...widget('a'), settings: { note: 'x'.repeat(5000) } }])).toBe(400);
    expect(await refused(Array.from({ length: 33 }, (_, index) => widget(`w${index}`)))).toBe(400);
  });

  it('deletes the dashboards of deleted accounts', async () => {
    const { client, account } = await signedInClient(app, 'editor');
    await client.put('/api/dashboard/me', { widgets: [widget('a')] });
    await deleteDashboardsOfUsers([account.id]);
    expect((await client.get('/api/dashboard/me')).body).toEqual({ widgets: null });
  });
});

describe('/api/dashboard/members', () => {
  it('needs users.view', async () => {
    expect((await testClient(app).get('/api/dashboard/members')).status).toBe(401);
    const { client } = await signedInClient(app, 'user');
    expect((await client.get('/api/dashboard/members')).status).toBe(403);
  });

  it('counts members only, by the day they joined', async () => {
    const yesterday = new Date(Date.now() - 86_400_000);
    for (const [role, createdAt] of [
      ['user', new Date('2020-01-01T12:00:00Z')],
      ['user', yesterday],
      ['user', new Date()],
      ['owner', new Date()],
    ] as const) {
      const account = await createTestAccount({ role });
      await UserModel.collection.updateOne({ _id: account.user._id }, { $set: { createdAt } });
    }
    const { client } = await signedInClient(app, 'editor');
    const week = await client.get('/api/dashboard/members?range=week&tz=UTC');
    expect(week.status).toBe(200);
    expect(week.body).toMatchObject({ range: 'week', unit: 'day', total: 3, joined: 2 });
    expect(week.body.points).toHaveLength(7);
    expect(week.body.points[0].total).toBe(1);
    expect((await client.get('/api/dashboard/members?range=all&tz=UTC')).body.unit).toBe('month');
  });

  it('refuses an unknown range or time zone', async () => {
    const { client } = await signedInClient(app, 'admin');
    expect((await client.get('/api/dashboard/members?range=decade')).body.field).toBe('range');
    expect((await client.get('/api/dashboard/members?range=week&tz=Mars/Olympus')).body.field).toBe('tz');
  });
});

describe('/api/dashboard/setup-checklist', () => {
  it('needs settings.edit', async () => {
    const { client } = await signedInClient(app, 'editor');
    expect((await client.get('/api/dashboard/setup-checklist')).status).toBe(403);
  });

  it('lists core’s and registered steps in order, detecting what it can', async () => {
    const { client } = await signedInClient(app, 'admin');
    await SettingsModel.create({ key: 'site', siteTitle: 'Acme', copyright: 'Acme Ltd', darkMode: false });
    const { items } = (await client.get('/api/dashboard/setup-checklist')).body as { items: { id: string; done: boolean; manual: boolean }[] };
    expect(items.map((item) => item.id)).toEqual([
      'plugin-shop:terms',
      'site-title',
      'logo',
      'logo-dark',
      'favicon',
      'theme',
      'fonts',
      'copyright',
      'privacy-policy',
      'home-page',
      'plugin-shop:payments',
    ]);
    const done = Object.fromEntries(items.map((item) => [item.id, item.done]));
    expect(done).toMatchObject({ 'site-title': true, logo: false, 'logo-dark': true, copyright: true, 'privacy-policy': false, 'plugin-shop:payments': true });
    expect(items.find((item) => item.id === 'plugin-shop:terms')?.manual).toBe(true);
  });

  it('ticks hand-ticked steps for the whole site', async () => {
    const { client } = await signedInClient(app, 'admin');
    const ticked = await client.put('/api/dashboard/setup-checklist/privacy-policy', { done: true });
    expect(ticked.body.items.find((item: { id: string }) => item.id === 'privacy-policy').done).toBe(true);

    const { client: owner } = await signedInClient(app, 'owner');
    const seen = (await owner.get('/api/dashboard/setup-checklist')).body.items.find((item: { id: string }) => item.id === 'privacy-policy');
    expect(seen.done).toBe(true);
    const unticked = await owner.put('/api/dashboard/setup-checklist/privacy-policy', { done: false });
    expect(unticked.body.items.find((item: { id: string }) => item.id === 'privacy-policy').done).toBe(false);
  });

  it('refuses ticking a detected step or an unknown one', async () => {
    const { client } = await signedInClient(app, 'owner');
    const detected = await client.put('/api/dashboard/setup-checklist/logo', { done: true });
    expect(detected.status).toBe(400);
    expect(detected.body.field).toBe('done');
    expect((await client.put('/api/dashboard/setup-checklist/nothing', { done: true })).status).toBe(404);
  });

  it('refuses two steps with one id', () => {
    expect(() => setupChecklistItems([{ id: 'logo', label: 'Again', order: 1 }])).toThrow(/logo/);
  });
});
