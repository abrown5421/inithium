import { describe, expect, it, vi } from 'vitest';
import { expectSeedIsIdempotent, testClient } from '@inithium/api-testing';
import { createTestApiWithAuth, signedInClient } from '@inithium/api-testing-accounts';
import { settingsRouter } from './settings.routes';
import { seedSiteSettings } from './settings.seed';

const app = createTestApiWithAuth((api) => api.use('/settings', settingsRouter));

describe('seedSiteSettings (decision 0082)', () => {
  it('creates the default settings once and never changes them', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const created = await expectSeedIsIdempotent(seedSiteSettings);
    log.mockRestore();
    expect(created.map((change) => [change.collection, change.added.length])).toEqual([['settings', 1]]);
  });
});

describe('/api/settings', () => {
  it('needs settings.edit', async () => {
    expect((await testClient(app).get('/api/settings')).status).toBe(401);
    const { client } = await signedInClient(app, 'editor');
    expect((await client.get('/api/settings')).status).toBe(403);
  });

  it('replaces the settings, clearing fields left out', async () => {
    const { client } = await signedInClient(app, 'admin');
    const theme = { colors: { primary: '#006a8e', secondary: '#ef4444', tertiary: '#22c55e', quaternary: '#eab308', accent: '#a855f7', surface: '#f5f5f4' } };
    expect((await client.put('/api/settings', { siteTitle: 'Acme', copyright: 'Acme Ltd', theme })).body).toMatchObject({ siteTitle: 'Acme', copyright: 'Acme Ltd', theme });
    const cleared = await client.put('/api/settings', { siteTitle: 'Acme' });
    expect(cleared.body).not.toHaveProperty('copyright');
    expect(cleared.body).not.toHaveProperty('theme');
  });

  it('refuses invalid settings', async () => {
    const { client } = await signedInClient(app, 'owner');
    expect((await client.put('/api/settings', { siteTitle: '' })).status).toBe(400);
  });
});
