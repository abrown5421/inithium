import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import sharp from 'sharp';
import { PageModel } from '@inithium/api-pages';
import { updateSiteSettings } from '@inithium/api-settings';
import { testClient, type TestClient } from '@inithium/api-testing';
import { createTestApiWithAuth, signedInClient } from '@inithium/api-testing-accounts';
import type { Asset, AssetUsage, StorageInfo } from '@inithium/shared-contracts';
import { AssetBlobModel, AssetModel } from './assets.model';
import { assetsRouter } from './assets.routes';

const app = createTestApiWithAuth((api) => api.use('/assets', assetsRouter));

/** A multipart upload body: the file plus the form's fields. */
function form(file: { data: Buffer | string; name: string; type?: string } | null, fields: Record<string, string>) {
  const body = new FormData();
  const bytes = (data: Buffer | string) => (typeof data === 'string' ? data : new Uint8Array(data));
  if (file) body.append('file', new Blob([bytes(file.data)], { type: file.type ?? 'application/octet-stream' }), file.name);
  for (const [key, value] of Object.entries(fields)) body.append(key, value);
  return body;
}

const png = (width = 64, height = 32) => sharp({ create: { width, height, channels: 3, background: '#3366cc' } }).png().toBuffer();

const upload = (client: TestClient, file: Parameters<typeof form>[0], fields: Record<string, string>) => client.post<Asset & { field?: string }>('/api/assets', form(file, fields));

describe('uploading (decision 0098)', () => {
  it('needs a signed-in account, and staff permission for site files', async () => {
    expect((await upload(testClient(app), { data: 'hello', name: 'a.txt' }, { purpose: 'document' })).status).toBe(401);
    const { client: member } = await signedInClient(app, 'user');
    expect((await upload(member, { data: 'hello', name: 'a.txt' }, { purpose: 'document' })).status).toBe(403);
  });

  it('refuses members’ own pictures while storage is the database', async () => {
    const { client: member } = await signedInClient(app, 'user');
    const response = await upload(member, { data: await png(), name: 'me.png', type: 'image/png' }, { purpose: 'avatar' });
    expect(response.status).toBe(409);
    expect(response.body.field).toBe('file');
  });

  it('turns images into WebP, records them and counts their storage', async () => {
    const { client } = await signedInClient(app, 'editor');
    const before = (await client.get<StorageInfo>('/api/assets/storage')).body.usedBytes;
    const response = await upload(client, { data: await png(), name: 'photo.png', type: 'image/png' }, { purpose: 'content', alt: 'A blue box' });
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ purpose: 'content', kind: 'image', contentType: 'image/webp', width: 64, height: 32, filename: 'photo.webp', alt: 'A blue box' });
    expect(await AssetBlobModel.exists({ _id: response.body.id })).toBeTruthy();
    expect((await client.get<StorageInfo>('/api/assets/storage')).body.usedBytes).toBe(before + response.body.size);
  });

  it('keeps favicons as PNG, at most 512px', async () => {
    const { client } = await signedInClient(app, 'admin');
    const response = await upload(client, { data: await png(1024, 1024), name: 'icon.png', type: 'image/png' }, { purpose: 'favicon' });
    expect(response.body).toMatchObject({ contentType: 'image/png', width: 512, height: 512 });
  });

  it('refuses files by their contents, the wrong kind for a purpose, and fonts without the licence', async () => {
    const { client } = await signedInClient(app, 'admin');
    const binary = Buffer.from([0, 1, 2, 3, 255, 0, 7]);
    expect((await upload(client, { data: binary, name: 'tool.exe' }, { purpose: 'content' })).status).toBe(415);
    // A PNG renamed to .txt is still a PNG, and a logo can't be a text file.
    expect((await upload(client, { data: 'plain words', name: 'notes.txt' }, { purpose: 'logo' })).status).toBe(415);
    const display = readFileSync(join(__dirname, '../../../../shared/ui-theme/src/fonts/display.woff2'));
    const noLicence = await upload(client, { data: display, name: 'brand.woff2' }, { purpose: 'font' });
    expect(noLicence.status).toBe(400);
    expect(noLicence.body.field).toBe('fontLicence');
  });

  it('asks for a file, and checks the fields', async () => {
    const { client } = await signedInClient(app, 'admin');
    expect((await upload(client, null, { purpose: 'content' })).body.field).toBe('file');
    expect((await upload(client, { data: 'x', name: 'a.txt' }, { purpose: 'sticker' })).status).toBe(400);
  });

  it('removes anything that could run from an SVG', async () => {
    const { client } = await signedInClient(app, 'admin');
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><script>alert(2)</script><rect width="10" height="10"/></svg>';
    const response = await upload(client, { data: svg, name: 'logo.svg', type: 'image/svg+xml' }, { purpose: 'logo' });
    expect(response.status).toBe(201);
    const served = await client.get<string>(`/api/assets/${response.body.id}`);
    expect(served.body).toContain('<rect');
    expect(served.body).not.toMatch(/script|onload/i);
  });
});

describe('serving (decision 0098)', () => {
  const stored = async () => {
    const { client } = await signedInClient(app, 'admin');
    const response = await upload(client, { data: 'Hello, world!', name: 'greeting.txt' }, { purpose: 'document' });
    return response.body;
  };

  it('sends files to anyone, safely and cached for a year', async () => {
    const asset = await stored();
    const response = await testClient(app).get<string>(`/api/assets/${asset.id}`);
    expect(response.status).toBe(200);
    expect(response.body).toBe('Hello, world!');
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
    expect(response.headers.get('content-security-policy')).toContain('sandbox');
    expect(response.headers.get('cache-control')).toBe('public, max-age=31536000, immutable');
    // Text files download rather than open.
    expect(response.headers.get('content-disposition')).toMatch(/^attachment; filename\*=UTF-8''greeting\.txt$/);
    expect((await testClient(app).get('/api/assets/missing')).status).toBe(404);
  });

  it('answers a repeat request with 304, and byte ranges with 206', async () => {
    const asset = await stored();
    const client = testClient(app);
    const first = await client.get(`/api/assets/${asset.id}`);
    const etag = first.headers.get('etag') ?? '';
    expect((await client.request('GET', `/api/assets/${asset.id}`, undefined, { 'if-none-match': etag })).status).toBe(304);
    const range = await client.request<string>('GET', `/api/assets/${asset.id}`, undefined, { range: 'bytes=0-4' });
    expect(range.status).toBe(206);
    expect(range.body).toBe('Hello');
    expect(range.headers.get('content-range')).toBe('bytes 0-4/13');
    expect((await client.request('GET', `/api/assets/${asset.id}`, undefined, { range: 'bytes=50-60' })).status).toBe(416);
  });
});

describe('managing files (decision 0098)', () => {
  it('lists staff files apart from members’, and searches names and descriptions', async () => {
    const { client } = await signedInClient(app, 'admin');
    await upload(client, { data: 'one', name: 'price-list.txt' }, { purpose: 'document' });
    await upload(client, { data: await png(), name: 'team.png', type: 'image/png' }, { purpose: 'content', alt: 'Our team' });
    await AssetModel.create({ _id: 'member-pic', purpose: 'avatar', kind: 'image', contentType: 'image/webp', size: 1, filename: 'me.webp', uploadedBy: 'm', driver: 'database', key: 'member-pic' });

    const names = async (query: string) => (await client.get<Asset[]>(`/api/assets${query}`)).body.map((asset) => asset.filename).sort();
    expect(await names('')).toEqual(['price-list.txt', 'team.webp']);
    expect(await names('?group=members')).toEqual(['me.webp']);
    expect(await names('?q=team')).toEqual(['team.webp']);
    expect(await names('?kind=document')).toEqual(['price-list.txt']);
  });

  it('renames and describes files, and only owners and admins delete them', async () => {
    const { client: editor } = await signedInClient(app, 'editor');
    const asset = (await upload(editor, { data: 'x', name: 'a.txt' }, { purpose: 'document' })).body;
    expect((await editor.patch<Asset>(`/api/assets/${asset.id}`, { filename: 'b.txt', alt: '' })).body.filename).toBe('b.txt');
    expect((await editor.patch(`/api/assets/${asset.id}`, { filename: '' })).status).toBe(400);
    expect((await editor.delete(`/api/assets/${asset.id}`)).status).toBe(403);
    const { client: admin } = await signedInClient(app, 'admin');
    expect((await admin.delete(`/api/assets/${asset.id}`)).status).toBe(204);
    expect(await AssetBlobModel.exists({ _id: asset.id })).toBeNull();
  });

  it('says where a file is used, and won’t delete the site logo', async () => {
    const { client } = await signedInClient(app, 'admin');
    const asset = (await upload(client, { data: await png(), name: 'logo.png', type: 'image/png' }, { purpose: 'logo' })).body;
    await updateSiteSettings({ siteTitle: 'Acme', logo: { assetId: asset.id, alt: 'Acme' } });
    const doc = { schemaVersion: 1, sections: [{ id: 's', layout: 'one', columns: [{ id: 'c', blocks: [{ id: 'i', type: 'image', assetId: asset.id, decorative: true }] }] }] };
    await PageModel.create({ title: 'About', path: '/about', template: 'content', layout: 'default', layouts: ['default'], content: { draft: doc } });

    const usage = await client.get<AssetUsage>(`/api/assets/${asset.id}/usage`);
    expect(usage.body.places).toEqual([
      { label: 'Site settings: the logo', blocking: true },
      { label: 'Page: About (unpublished changes)', blocking: false },
    ]);
    expect((await client.delete(`/api/assets/${asset.id}`)).status).toBe(409);
  });

  it('won’t delete the dark mode logo (decision 0119)', async () => {
    const { client } = await signedInClient(app, 'admin');
    const asset = (await upload(client, { data: await png(), name: 'logo-dark.png', type: 'image/png' }, { purpose: 'logo' })).body;
    await updateSiteSettings({ siteTitle: 'Acme', logoDark: { assetId: asset.id, alt: 'Acme' } });
    expect((await client.get<AssetUsage>(`/api/assets/${asset.id}/usage`)).body.places).toEqual([
      { label: 'Site settings: the dark mode logo', blocking: true },
    ]);
    expect((await client.delete(`/api/assets/${asset.id}`)).status).toBe(409);
  });
});
