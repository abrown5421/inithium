import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import type { IncomingMessage } from 'node:http';
import {
  buildAbsolutePath,
  buildTrashPath,
  categoryDir,
  resolveCategory,
  ASSETS_ROOT,
  TRASH_ROOT,
  trashDir,
} from '../config/index.js';
import type { AdapterOutcome, FileCategory, FileMetadata } from '../types/index.js';

const ensureDir = (dir: string): Promise<void> =>
  fsp.mkdir(dir, { recursive: true }).then(() => undefined);

export const initStorageDirs = async (): Promise<void> => {
  const categories: FileCategory[] = [
    'images',
    'fonts',
    'videos',
    'audio',
    'documents',
    'misc',
  ];
  await Promise.all([
    ensureDir(ASSETS_ROOT),
    ensureDir(TRASH_ROOT),
    ...categories.map((c) => ensureDir(categoryDir(c))),
    ...categories.map((c) => ensureDir(trashDir(c))),
  ]);
};

export const writeFileStream = async (
  source: Readable | IncomingMessage,
  storageKey: string,
  mimeType: string
): Promise<AdapterOutcome<FileMetadata>> => {
  const category = resolveCategory(mimeType);
  const absolutePath = buildAbsolutePath(category, storageKey);

  await ensureDir(categoryDir(category));

  try {
    const dest = fs.createWriteStream(absolutePath);
    await pipeline(source as Readable, dest);
    const { size } = await fsp.stat(absolutePath);
    return {
      ok: true,
      data: {
        storageKey,
        category,
        mimeType,
        originalName: storageKey,
        sizeBytes: size,
        absolutePath,
      },
    };
  } catch (err) {
    return { ok: false, error: String(err), code: 'WRITE_FAILED' };
  }
};

export const readFileStream = (
  absolutePath: string
): AdapterOutcome<fs.ReadStream> => {
  if (!fs.existsSync(absolutePath)) {
    return { ok: false, error: 'File not found', code: 'NOT_FOUND' };
  }
  return { ok: true, data: fs.createReadStream(absolutePath) };
};

export const resolveStoragePath = (
  storageKey: string,
  mimeType: string
): string => {
  const category = resolveCategory(mimeType);
  return buildAbsolutePath(category, storageKey);
};

export const softDeleteFile = async (
  storageKey: string,
  mimeType: string
): Promise<AdapterOutcome<string>> => {
  const category = resolveCategory(mimeType);
  const src = buildAbsolutePath(category, storageKey);
  const dest = buildTrashPath(category, storageKey);

  if (!fs.existsSync(src)) {
    return { ok: false, error: 'File not found', code: 'NOT_FOUND' };
  }

  try {
    await ensureDir(path.dirname(dest));
    await fsp.rename(src, dest);
    return { ok: true, data: dest };
  } catch (err) {
    return { ok: false, error: String(err), code: 'SOFT_DELETE_FAILED' };
  }
};

export const permanentDeleteFile = async (
  storageKey: string,
  mimeType: string
): Promise<AdapterOutcome<void>> => {
  const category = resolveCategory(mimeType);
  const trashPath = buildTrashPath(category, storageKey);

  try {
    await fsp.unlink(trashPath);
    return { ok: true, data: undefined };
  } catch (err) {
    return { ok: false, error: String(err), code: 'DELETE_FAILED' };
  }
};

export const restoreFile = async (
  storageKey: string,
  mimeType: string
): Promise<AdapterOutcome<string>> => {
  const category = resolveCategory(mimeType);
  const trashPath = buildTrashPath(category, storageKey);
  const activePath = buildAbsolutePath(category, storageKey);

  if (!fs.existsSync(trashPath)) {
    return { ok: false, error: 'File not found in trash', code: 'NOT_IN_TRASH' };
  }

  try {
    await fsp.rename(trashPath, activePath);
    return { ok: true, data: activePath };
  } catch (err) {
    return { ok: false, error: String(err), code: 'RESTORE_FAILED' };
  }
};

export const fileExists = (storageKey: string, mimeType: string): boolean => {
  const category = resolveCategory(mimeType);
  return fs.existsSync(buildAbsolutePath(category, storageKey));
};
