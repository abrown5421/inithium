import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { FontFamilyModel } from '@inithium/api-fonts';
import { createTestApiWithAuth, signedInClient } from '@inithium/api-testing-accounts';
import { MAX_FONT_FAMILIES, type FontFamilyRecord, type FontFileInfo } from '@inithium/shared-contracts';
import { processUpload } from './asset-processing.service';
import { AssetModel } from './assets.model';
import { assetsRouter } from './assets.routes';
import { assetUsage, createAsset, deleteAsset, updateAsset } from './assets.service';
import { fontFamiliesRouter } from './font-families.routes';

const app = createTestApiWithAuth((api) => {
  api.use('/assets', assetsRouter);
  api.use('/fonts', fontFamiliesRouter);
});

// Core's own default fonts: Bruno Ace SC (one weight, 400) and Merriweather Sans (variable, 300–800).
const fontsDir = join(__dirname, '../../../../shared/ui-theme/src/fonts');
const displayFont = readFileSync(join(fontsDir, 'display.woff2'));
const bodyFont = readFileSync(join(fontsDir, 'body.woff2'));

const upload = (data: Buffer, originalName: string) =>
  createAsset({ data, originalName }, { purpose: 'font', uploadedBy: 'tester', staff: true, fontLicence: true });

const metrics: FontFileInfo['metrics'] = { unitsPerEm: 1000, ascent: 900, descent: 250, lineGap: 0 };

/** A font asset record with the given weight and style, without real bytes (families only read the stored details). */
async function fakeFont(name: string, weight: number | [number, number], style: 'normal' | 'italic' = 'normal') {
  const id = randomBytes(16).toString('base64url');
  const [min, max] = typeof weight === 'number' ? [weight, weight] : weight;
  const font: FontFileInfo = { family: 'Fake Sans', weight: { min, max }, style, metrics };
  return AssetModel.create({
    _id: id, purpose: 'font', kind: 'font', contentType: 'font/woff2', size: 100, filename: name, uploadedBy: 'tester', driver: 'database', key: id, font,
  });
}

describe('reading uploaded font files (decision 0111)', () => {
  it('records a single-weight font’s family name, weight, style and metrics', async () => {
    const processed = await processUpload(displayFont, 'brand.woff2', { purpose: 'font', staff: true, fontLicence: true });
    expect(processed.font).toMatchObject({ family: 'Bruno Ace SC', weight: { min: 400, max: 400 }, style: 'normal' });
    expect(processed.font?.metrics.unitsPerEm).toBe(1000);
  });

  it('records a variable font’s weight axis as a range', async () => {
    const processed = await processUpload(bodyFont, 'body.woff2', { purpose: 'font', staff: true, fontLicence: true });
    expect(processed.font).toMatchObject({ family: 'Merriweather Sans', weight: { min: 300, max: 800 }, style: 'normal' });
  });

  it('refuses a file that looks like a font but can’t be read as one', async () => {
    const broken = Buffer.concat([Buffer.from('wOF2'), Buffer.alloc(200)]);
    await expect(processUpload(broken, 'broken.woff2', { purpose: 'font', staff: true, fontLicence: true })).rejects.toMatchObject({ status: 415, field: 'file' });
  });

  it('stores the details on the asset and returns them', async () => {
    const asset = await upload(displayFont, 'brand.woff2');
    const { client } = await signedInClient(app, 'editor');
    const response = await client.get<{ font?: FontFileInfo }>(`/api/assets/${asset._id}/info`);
    expect(response.body.font).toMatchObject({ weight: { min: 400, max: 400 }, style: 'normal' });
  });
});

describe('/api/fonts permissions', () => {
  it('needs a signed-in account allowed to upload files', async () => {
    const { client: member } = await signedInClient(app, 'user');
    expect((await member.get('/api/fonts')).status).toBe(403);
    expect((await member.post('/api/fonts', { name: 'X', fallback: 'sans', assetIds: ['a'] })).status).toBe(403);
    const { client: anonymous } = await signedInClient(app, 'user');
    anonymous.clearCookies();
    expect((await anonymous.get('/api/fonts')).status).toBe(401);
  });

  it('lets editors manage families', async () => {
    const font = await fakeFont('regular.woff2', 400);
    const { client } = await signedInClient(app, 'editor');
    const created = await client.post<FontFamilyRecord>('/api/fonts', { name: 'Brand', fallback: 'serif', assetIds: [font._id] });
    expect(created.status).toBe(201);
    expect((await client.patch(`/api/fonts/${created.body.id}`, { name: 'Brand 2' })).status).toBe(200);
    expect((await client.delete(`/api/fonts/${created.body.id}`)).status).toBe(204);
  });
});

describe('font families (decision 0111)', () => {
  it('group files with the weight and style read from each, lightest upright first', async () => {
    const bold = await fakeFont('bold.woff2', 700);
    const italic = await fakeFont('italic.woff2', 400, 'italic');
    const regular = await fakeFont('regular.woff2', 400);
    const { client } = await signedInClient(app, 'admin');
    const created = await client.post<FontFamilyRecord>('/api/fonts', { name: 'Brand Sans', fallback: 'sans', assetIds: [bold._id, italic._id, regular._id] });
    expect(created.status).toBe(201);
    expect(created.body.files.map((file) => file.filename)).toEqual(['regular.woff2', 'bold.woff2', 'italic.woff2']);
    expect(created.body.files[1]).toMatchObject({ weight: { min: 700, max: 700 }, style: 'normal', url: `/api/assets/${bold._id}` });
    const listed = await client.get<FontFamilyRecord[]>('/api/fonts');
    expect(listed.body.map((family) => family.name)).toEqual(['Brand Sans']);
  });

  it('refuse two files covering the same weight and style, naming them', async () => {
    const variable = await upload(bodyFont, 'body.woff2');
    const regular = await upload(displayFont, 'display.woff2');
    const { client } = await signedInClient(app, 'admin');
    const response = await client.post<{ message: string; field: string }>('/api/fonts', { name: 'Mixed', fallback: 'sans', assetIds: [variable._id, regular._id] });
    expect(response.status).toBe(400);
    expect(response.body.field).toBe('assetIds');
    expect(response.body.message).toContain('body.woff2 and display.woff2');
  });

  it('refuse a file another family already holds', async () => {
    const font = await fakeFont('shared.woff2', 400);
    const { client } = await signedInClient(app, 'admin');
    await client.post('/api/fonts', { name: 'First', fallback: 'sans', assetIds: [font._id] });
    const response = await client.post<{ field: string; message: string }>('/api/fonts', { name: 'Second', fallback: 'sans', assetIds: [font._id] });
    expect(response.status).toBe(409);
    expect(response.body).toMatchObject({ field: 'assetIds', message: expect.stringContaining('First') });
  });

  it('refuse files that aren’t fonts, and ones that no longer exist', async () => {
    const image = await AssetModel.create({
      _id: 'an-image', purpose: 'content', kind: 'image', contentType: 'image/webp', size: 10, filename: 'photo.webp', uploadedBy: 'tester', driver: 'database', key: 'an-image',
    });
    const { client } = await signedInClient(app, 'admin');
    expect((await client.post('/api/fonts', { name: 'X', fallback: 'sans', assetIds: [image._id] })).status).toBe(400);
    expect((await client.post('/api/fonts', { name: 'X', fallback: 'sans', assetIds: ['missing'] })).status).toBe(400);
    expect((await client.post('/api/fonts', { name: '', fallback: 'sans', assetIds: [] })).status).toBe(400);
  });

  it(`stop at ${MAX_FONT_FAMILIES} families`, async () => {
    const { client } = await signedInClient(app, 'admin');
    for (let index = 0; index < MAX_FONT_FAMILIES; index++) {
      const font = await fakeFont(`font-${index}.woff2`, 400);
      expect((await client.post('/api/fonts', { name: `Family ${index}`, fallback: 'sans', assetIds: [font._id] })).status).toBe(201);
    }
    const extra = await fakeFont('extra.woff2', 400);
    expect((await client.post('/api/fonts', { name: 'One too many', fallback: 'sans', assetIds: [extra._id] })).status).toBe(409);
  });

  it('read older font uploads, which have no stored details, when they’re added', async () => {
    const old = await upload(bodyFont, 'old.woff2');
    await AssetModel.updateOne({ _id: old._id }, { $unset: { font: 1 } });
    const { client } = await signedInClient(app, 'admin');
    const created = await client.post<FontFamilyRecord>('/api/fonts', { name: 'Old', fallback: 'sans', assetIds: [old._id] });
    expect(created.body.files[0]?.weight).toEqual({ min: 300, max: 800 });
    expect((await AssetModel.findById(old._id))?.font).toMatchObject({ weight: { min: 300, max: 800 } });
  });

  it('change files on update and keep the removed ones as loose fonts', async () => {
    const regular = await fakeFont('regular.woff2', 400);
    const bold = await fakeFont('bold.woff2', 700);
    const { client } = await signedInClient(app, 'admin');
    const created = await client.post<FontFamilyRecord>('/api/fonts', { name: 'Brand', fallback: 'sans', assetIds: [regular._id, bold._id] });
    const updated = await client.patch<FontFamilyRecord>(`/api/fonts/${created.body.id}`, { fallback: 'mono', assetIds: [bold._id] });
    expect(updated.body).toMatchObject({ fallback: 'mono', files: [expect.objectContaining({ assetId: bold._id })] });
    // Re-saving a family's own files isn't "already in another family".
    expect((await client.patch(`/api/fonts/${created.body.id}`, { assetIds: [bold._id, regular._id] })).status).toBe(200);
    expect((await client.delete(`/api/fonts/${created.body.id}`)).status).toBe(204);
    expect(await AssetModel.countDocuments({ _id: { $in: [regular._id, bold._id] } })).toBe(2);
    expect((await client.patch('/api/fonts/0123456789abcdef01234567', { name: 'Nope' })).status).toBe(404);
  });
});

describe('font files in families', () => {
  it('show the family where they’re used, and leave it when deleted', async () => {
    const font = await fakeFont('regular.woff2', 400);
    const family = await FontFamilyModel.create({
      name: 'Brand', fallback: 'sans', files: [{ assetId: font._id, filename: font.filename, contentType: font.contentType, weight: { min: 400, max: 400 }, style: 'normal' }],
    });
    expect((await assetUsage(font._id)).places).toContainEqual({ label: 'Font family: Brand', blocking: false });
    await deleteAsset(font);
    expect((await FontFamilyModel.findById(family._id))?.files).toHaveLength(0);
  });

  it('keep the family’s copy of the name in step with the asset', async () => {
    const font = await fakeFont('regular.woff2', 400);
    const family = await FontFamilyModel.create({
      name: 'Brand', fallback: 'sans', files: [{ assetId: font._id, filename: font.filename, contentType: font.contentType, weight: { min: 400, max: 400 }, style: 'normal' }],
    });
    await updateAsset(font, { filename: 'Brand Regular.woff2' });
    expect((await FontFamilyModel.findById(family._id))?.files[0]?.filename).toBe('Brand Regular.woff2');
  });
});
