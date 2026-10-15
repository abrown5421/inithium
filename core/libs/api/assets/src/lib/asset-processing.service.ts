import { extname } from 'node:path';
import createDOMPurify from 'dompurify';
import { fileTypeFromBuffer } from 'file-type';
import { JSDOM } from 'jsdom';
import sharp from 'sharp';
import { compress as toWoff2 } from 'wawoff2';
import {
  assetFileTypes,
  assetPurposeKinds,
  MAX_ASSET_BYTES,
  type AssetKind,
  type AssetPurpose,
  type FontFileInfo,
} from '@inithium/shared-contracts';
import { readFontInfo } from './font-files.service';

/** An error the API's error handler sends with its status, message and the form field it's about. */
export const failure = (status: number, message: string, field?: string) => Object.assign(new Error(message), { status, field });

/** A file ready to store: its bytes after processing, what it is, and its dimensions if it's an image. */
export type ProcessedFile = {
  data: Buffer;
  contentType: string;
  kind: AssetKind;
  /** The uploaded name with the stored type's extension, e.g. 'brand.ttf' becomes 'brand.woff2'. */
  filename: string;
  width?: number;
  height?: number;
  /** For fonts: what the file covers, read from it (decision 0111). */
  font?: FontFileInfo;
};

export type ProcessOptions = {
  purpose: AssetPurpose;
  /** Staff may upload any allowed type; members only avatar and banner images. */
  staff: boolean;
  /** Fonts only: the uploader confirmed they may use the font on the web. */
  fontLicence: boolean;
};

/** Raster images are shrunk to fit inside this many pixels each way. */
const MAX_IMAGE_SIDE = 2560;
/** WebP qualities tried in turn until the image fits in 2 MB. */
const QUALITIES = [82, 72, 62, 50, 40];
const RASTER = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif']);
const TOO_BIG = `Files can be at most ${MAX_ASSET_BYTES / 1024 / 1024} MB`;

/** The uploaded file name, cleaned: no folders, at most 200 characters, with the given extension. */
function cleanName(original: string, extension: string): string {
  const base = original.replace(/^.*[\\/]/, '').replace(extname(original), '').replace(/\p{Cc}/gu, '').trim() || 'file';
  return `${base.slice(0, 190)}.${extension}`;
}

/**
 * What a file really is, from its contents (decision 0098). Text files have no signature, so .txt, .csv and .svg are
 * recognised by name and then checked: readable text with no binary bytes, and an <svg> root for SVG.
 */
async function detect(data: Buffer, originalName: string): Promise<string | null> {
  const found = await fileTypeFromBuffer(data);
  if (found) {
    if (found.mime === 'image/vnd.microsoft.icon') return 'image/x-icon';
    // Fonts arrive as TTF or OTF and are converted to WOFF2 below.
    if (found.mime === 'font/ttf' || found.mime === 'font/otf') return found.mime;
    return assetFileTypes[found.mime] ? found.mime : null;
  }
  const extension = extname(originalName).slice(1).toLowerCase();
  const text = data.toString('utf8');
  const binary = data.includes(0) || text.includes('�');
  if (binary) return null;
  if (extension === 'svg' && /<svg[\s>]/i.test(text)) return 'image/svg+xml';
  if (extension === 'txt') return 'text/plain';
  if (extension === 'csv') return 'text/csv';
  return null;
}

/** A favicon's largest side: browsers ask for at most 512px (e.g. for installed web apps). */
const MAX_FAVICON_SIDE = 512;

/**
 * A raster favicon as a PNG (decision 0101): browsers don't all take WebP favicons. Oriented, its first frame only,
 * shrunk to 512px and metadata stripped.
 */
async function processFaviconRaster(data: Buffer): Promise<{ data: Buffer; width: number; height: number }> {
  const output = await sharp(data, { limitInputPixels: 100_000_000 })
    .rotate()
    .resize({ width: MAX_FAVICON_SIDE, height: MAX_FAVICON_SIDE, fit: 'inside', withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toBuffer({ resolveWithObject: true });
  return { data: output.data, width: output.info.width, height: output.info.height };
}

/** A raster image as WebP: oriented, shrunk to 2560px, metadata stripped, and squeezed under 2 MB. */
async function processRaster(data: Buffer): Promise<{ data: Buffer; width: number; height: number }> {
  let side = MAX_IMAGE_SIDE;
  for (let attempt = 0; attempt < 6; attempt++) {
    for (const quality of QUALITIES) {
      // `animated` keeps GIF and WebP animations; rotate() applies the photo's orientation before metadata is dropped.
      const output = await sharp(data, { animated: true, limitInputPixels: 100_000_000 })
        .rotate()
        .resize({ width: side, height: side, fit: 'inside', withoutEnlargement: true })
        .webp({ quality, effort: 4 })
        .toBuffer({ resolveWithObject: true });
      if (output.data.length <= MAX_ASSET_BYTES) {
        const height = output.info.pageHeight ?? output.info.height;
        return { data: output.data, width: output.info.width, height };
      }
    }
    side = Math.round(side * 0.75);
  }
  throw failure(413, 'This image is too detailed to fit in 2 MB, even shrunk. Try a smaller image.', 'file');
}

/** An SVG with anything that could run removed (scripts, event handlers, external references). */
function cleanSvg(data: Buffer): Buffer {
  const purify = createDOMPurify(new JSDOM('').window);
  const clean = purify.sanitize(data.toString('utf8'), { USE_PROFILES: { svg: true, svgFilters: true } });
  if (!/<svg[\s>]/i.test(clean)) throw failure(400, 'This SVG has nothing left once unsafe parts are removed', 'file');
  return Buffer.from(clean, 'utf8');
}

/**
 * Checks and prepares an upload for storage (decision 0098): only allowed types (by contents), the right kind for its
 * purpose, members only images for avatars and banners, images re-encoded as WebP under 2 MB (favicons as PNG), SVGs cleaned, TTF and
 * OTF fonts converted to WOFF2, and every stored file at most 2 MB.
 */
export async function processUpload(data: Buffer, originalName: string, options: ProcessOptions): Promise<ProcessedFile> {
  const detected = await detect(data, originalName);
  if (!detected) throw failure(415, 'This type of file can’t be uploaded', 'file');

  if (!options.staff && !RASTER.has(detected)) {
    throw failure(415, 'Profile images must be PNG, JPEG, WebP, GIF or AVIF', 'file');
  }

  // Fonts: TTF and OTF become WOFF2; every font needs the uploader's licence confirmation.
  if (detected === 'font/ttf' || detected === 'font/otf' || detected === 'font/woff' || detected === 'font/woff2') {
    if (!assetPurposeKinds[options.purpose].includes('font')) throw failure(415, 'Fonts can only be uploaded as fonts', 'file');
    if (!options.fontLicence) throw failure(400, 'Confirm you may use this font on the web', 'fontLicence');
    const converted = detected === 'font/ttf' || detected === 'font/otf' ? Buffer.from(await toWoff2(data)) : data;
    if (converted.length > MAX_ASSET_BYTES) throw failure(413, TOO_BIG, 'file');
    const font = readFontInfo(converted);
    if (!font) throw failure(415, 'This font file can’t be read. Try another copy of the font.', 'file');
    const contentType = detected === 'font/woff' ? 'font/woff' : 'font/woff2';
    return { data: converted, contentType, kind: 'font', font, filename: cleanName(originalName, contentType === 'font/woff' ? 'woff' : 'woff2') };
  }

  const type = assetFileTypes[detected];
  if (!type) throw failure(415, 'This type of file can’t be uploaded', 'file');
  if (!assetPurposeKinds[options.purpose].includes(type.kind)) {
    throw failure(415, `A ${options.purpose} can’t be a ${type.label.toLowerCase()}`, 'file');
  }

  if (RASTER.has(detected) && options.purpose === 'favicon') {
    const image = await processFaviconRaster(data);
    return { ...image, contentType: 'image/png', kind: 'image', filename: cleanName(originalName, 'png') };
  }
  if (RASTER.has(detected)) {
    const image = await processRaster(data);
    return { ...image, contentType: 'image/webp', kind: 'image', filename: cleanName(originalName, 'webp') };
  }
  if (detected === 'image/svg+xml') {
    const clean = cleanSvg(data);
    if (clean.length > MAX_ASSET_BYTES) throw failure(413, TOO_BIG, 'file');
    return { data: clean, contentType: detected, kind: 'image', filename: cleanName(originalName, 'svg') };
  }
  if (detected === 'image/x-icon') {
    const metadata = await sharp(data).metadata().catch(() => null);
    if (data.length > MAX_ASSET_BYTES) throw failure(413, TOO_BIG, 'file');
    return { data, contentType: detected, kind: 'image', filename: cleanName(originalName, 'ico'), width: metadata?.width, height: metadata?.height };
  }

  // Documents, audio and video are stored as they are.
  if (data.length > MAX_ASSET_BYTES) {
    throw failure(413, type.kind === 'video' ? `${TOO_BIG}: only very short clips fit` : TOO_BIG, 'file');
  }
  return { data, contentType: detected, kind: type.kind, filename: cleanName(originalName, type.extensions[0] ?? 'bin') };
}
