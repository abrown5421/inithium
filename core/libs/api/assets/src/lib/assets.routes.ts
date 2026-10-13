import { Router, type Request, type Response } from 'express';
import multer from 'multer';
import {
  assetFileTypes,
  assetKindSchema,
  assetPurposeSchema,
  assetUpdateSchema,
  assetUploadFieldsSchema,
  type Asset,
  type AssetUsage,
  type StorageInfo,
} from '@inithium/shared-contracts';
import { hasPermission } from '@inithium/shared-permissions';
import { getAuth, requireAuth, requirePermission } from '@inithium/api-auth';
import {
  assetUsage,
  createAsset,
  deleteAsset,
  findAsset,
  listAssets,
  readAssetBytes,
  storageInfo,
  toAsset,
  updateAsset,
} from './assets.service';

/** The largest file accepted before processing: big photos are shrunk to fit 2 MB, so they may arrive larger. */
const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 } });

const notFound = (res: Response) => res.status(404).send({ message: 'File not found' });
const param = (req: Request, name: string) => String(req.params[name]);

/** Mounted at /api/assets (decisions 0028, 0098). */
export const assetsRouter = Router();

/** Where files go and how much room is left. Any signed-in user may ask, so profiles can offer uploads or not. */
assetsRouter.get('/storage', requireAuth, async (_req, res) => {
  const body: StorageInfo = await storageInfo();
  res.send(body);
});

/** Every asset, for the CMS's Media screen and pickers. */
assetsRouter.get('/', ...requirePermission('assets.upload'), async (req, res) => {
  const purpose = assetPurposeSchema.safeParse(req.query['purpose']);
  const kind = assetKindSchema.safeParse(req.query['kind']);
  const search = typeof req.query['q'] === 'string' ? req.query['q'].trim().slice(0, 100) : '';
  const body: Asset[] = (
    await listAssets({ purpose: purpose.success ? purpose.data : undefined, kind: kind.success ? kind.data : undefined, search: search || undefined })
  ).map(toAsset);
  res.send(body);
});

/**
 * Uploads one file (multipart: `file`, `purpose`, optional `alt` and, for fonts, `fontLicence=true`). Staff need
 * assets.upload; members may upload only their own avatar and banner, and only with cloud storage for everyone.
 */
assetsRouter.post('/', requireAuth, (req, res, next) => {
  upload.single('file')(req, res, (error: unknown) => {
    if ((error as { code?: string } | undefined)?.code === 'LIMIT_FILE_SIZE') {
      res.status(413).send({ message: `Files can be at most ${MAX_UPLOAD_BYTES / 1024 / 1024} MB before processing`, field: 'file' });
      return;
    }
    if (error) return next(error);
    next();
  });
}, async (req, res) => {
  const fields = assetUploadFieldsSchema.safeParse(req.body);
  if (!fields.success) {
    res.status(400).send({ message: 'Check the highlighted fields and try again', issues: fields.error.issues });
    return;
  }
  if (!req.file) {
    res.status(400).send({ message: 'Choose a file to upload', field: 'file' });
    return;
  }
  const { role, sub } = getAuth(res);
  const member = fields.data.purpose === 'avatar' || fields.data.purpose === 'banner';
  const staff = hasPermission(role, 'assets.upload');
  if (!member && !staff) {
    res.status(403).send({ message: 'You do not have permission to upload files' });
    return;
  }
  const asset = await createAsset(
    { data: req.file.buffer, originalName: req.file.originalname },
    { purpose: fields.data.purpose, alt: fields.data.alt, uploadedBy: sub, staff: !member, fontLicence: fields.data.fontLicence === 'true' },
  );
  res.status(201).send(toAsset(asset));
});

/** One asset's details (not its file), e.g. to show the image a field has chosen. */
assetsRouter.get('/:id/info', ...requirePermission('assets.upload'), async (req, res) => {
  const asset = await findAsset(param(req, 'id'));
  if (!asset) return void notFound(res);
  const body: Asset = toAsset(asset);
  res.send(body);
});

/** Where an asset is used, so the CMS can warn before deleting it. */
assetsRouter.get('/:id/usage', ...requirePermission('assets.upload'), async (req, res) => {
  const asset = await findAsset(param(req, 'id'));
  if (!asset) return void notFound(res);
  const body: AssetUsage = await assetUsage(asset._id);
  res.send(body);
});

/** Renames an asset or changes its default alt text. */
assetsRouter.patch('/:id', ...requirePermission('assets.upload'), async (req, res) => {
  const parsed = assetUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).send({ message: 'Check the highlighted fields and try again', issues: parsed.error.issues });
    return;
  }
  const asset = await findAsset(param(req, 'id'));
  if (!asset) return void notFound(res);
  res.send(toAsset(await updateAsset(asset, parsed.data)));
});

/** Deletes an asset, unless the site logo uses it. */
assetsRouter.delete('/:id', ...requirePermission('assets.delete'), async (req, res) => {
  const asset = await findAsset(param(req, 'id'));
  if (!asset) return void notFound(res);
  await deleteAsset(asset);
  res.status(204).end();
});

/**
 * Serves an asset's file to anyone (every asset is public, decision 0098), safely: the stored type with nosniff, a
 * sandboxing CSP so nothing in a file can run, downloads for types browsers shouldn't open, and a year's caching,
 * since an id's file never changes. Byte ranges are honoured so audio and video can seek.
 */
assetsRouter.get('/:id', async (req, res) => {
  const asset = await findAsset(param(req, 'id'));
  if (!asset) return void notFound(res);
  const data = await readAssetBytes(asset);
  if (!data) return void notFound(res);

  const inline = assetFileTypes[asset.contentType]?.inline ?? false;
  const name = encodeURIComponent(asset.filename);
  res.set({
    'Content-Type': asset.contentType,
    'X-Content-Type-Options': 'nosniff',
    // PDFs need the browser's own viewer, which a sandbox would block; everything else is fully sandboxed.
    'Content-Security-Policy':
      asset.contentType === 'application/pdf'
        ? "default-src 'none'; object-src 'none'; script-src 'none'"
        : "default-src 'none'; style-src 'unsafe-inline'; img-src data:; media-src 'self'; sandbox",
    'Content-Disposition': `${inline ? 'inline' : 'attachment'}; filename*=UTF-8''${name}`,
    'Cache-Control': 'public, max-age=31536000, immutable',
    'Cross-Origin-Resource-Policy': 'same-site',
    'Accept-Ranges': 'bytes',
    ETag: `"${asset._id}"`,
  });
  if (req.headers['if-none-match'] === `"${asset._id}"`) return void res.status(304).end();

  const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range ?? '');
  if (range && (range[1] || range[2])) {
    const size = data.length;
    const start = range[1] ? Number(range[1]) : Math.max(0, size - Number(range[2]));
    const end = range[1] && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
    if (start >= size || start > end) {
      res.status(416).set('Content-Range', `bytes */${size}`).end();
      return;
    }
    res.status(206).set('Content-Range', `bytes ${start}-${end}/${size}`).send(data.subarray(start, end + 1));
    return;
  }
  res.send(data);
});
