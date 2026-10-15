import { describe, expect, it, vi } from 'vitest';
import mongoose from 'mongoose';
import { FontFamilyModel } from '@inithium/api-fonts';
import { createTestApiWithAuth, signedInClient } from '@inithium/api-testing-accounts';
import { settingsRouter } from './settings.routes';
import { renderAppPage, themeFontsHead } from './theme-fonts.service';

const app = createTestApiWithAuth((api) => api.use('/settings', settingsRouter));

const metrics = { unitsPerEm: 1000, ascent: 900, descent: 250, lineGap: 0, xAvgCharWidth: 500 };
const family = (name: string, files = [{ assetId: `${name}-regular`, filename: 'r.woff2', contentType: 'font/woff2', weight: { min: 400, max: 400 }, style: 'normal', metrics }]) =>
  FontFamilyModel.create({ name, fallback: 'sans', files });

describe('theme fonts in settings (decision 0111)', () => {
  it('save a library family for each role, and clear them when left out', async () => {
    const brand = await family('Brand');
    const { client } = await signedInClient(app, 'admin');
    const saved = await client.put('/api/settings', { siteTitle: 'Acme', fonts: { display: String(brand._id) } });
    expect(saved.status).toBe(200);
    expect(saved.body).toMatchObject({ fonts: { display: String(brand._id) } });
    expect((await client.put('/api/settings', { siteTitle: 'Acme' })).body).not.toHaveProperty('fonts');
  });

  it('refuse a family that isn’t in the library, or has no files, naming the field', async () => {
    const empty = await family('Empty', []);
    const { client } = await signedInClient(app, 'owner');
    const missing = await client.put<{ field: string }>('/api/settings', { siteTitle: 'Acme', fonts: { body: '0123456789abcdef01234567' } });
    expect(missing.status).toBe(400);
    expect(missing.body.field).toBe('fonts.body');
    const noFiles = await client.put<{ field: string; message: string }>('/api/settings', { siteTitle: 'Acme', fonts: { display: String(empty._id) } });
    expect(noFiles.status).toBe(400);
    expect(noFiles.body).toMatchObject({ field: 'fonts.display', message: expect.stringContaining('Empty has no files') });
  });
});

describe('the page’s font rules (decision 0114)', () => {
  it('preload the theme fonts and declare every family, rebuilt when the theme changes', async () => {
    const brand = await family('Brand');
    const other = await family('Other');
    const { client } = await signedInClient(app, 'admin');

    await client.put('/api/settings', { siteTitle: 'Acme' });
    const before = await themeFontsHead();
    expect(before).not.toContain('rel="preload"');
    expect(before).toContain(`Inithium Font ${String(other._id)}`);
    expect(before).not.toContain('--font-display');

    await client.put('/api/settings', { siteTitle: 'Acme', fonts: { display: String(brand._id) } });
    const after = await themeFontsHead();
    expect(after).toContain(`<link rel="preload" href="/api/assets/Brand-regular" as="font" type="font/woff2" crossorigin>`);
    expect(after).toContain(`--font-display:'Inithium Font ${String(brand._id)}', 'Inithium Font ${String(brand._id)} Fallback'`);
  });

  it('go into the page just before </head>', async () => {
    const brand = await family('Brand');
    const { client } = await signedInClient(app, 'admin');
    await client.put('/api/settings', { siteTitle: 'Acme', fonts: { body: String(brand._id) } });
    const page = await renderAppPage('<html><head><title>x</title></head><body></body></html>');
    expect(page).toMatch(/<title>x<\/title><link rel="preload"[^>]+><style id="inithium-theme-fonts">[\s\S]*<\/style><\/head>/);
  });

  it('leave the page as built if the fonts can’t be read', async () => {
    const brand = await family('Brand');
    const { client } = await signedInClient(app, 'admin');
    // A change, so the cached head is rebuilt (and fails).
    await client.put('/api/settings', { siteTitle: 'Acme', fonts: { body: String(brand._id) } });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const find = vi.spyOn(mongoose.Model, 'find').mockImplementation(() => {
      throw new Error('database down');
    });
    try {
      expect(await renderAppPage('<head></head>')).toBe('<head></head>');
    } finally {
      find.mockRestore();
      warn.mockRestore();
    }
  });
});
