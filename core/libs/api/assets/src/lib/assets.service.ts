import { randomBytes } from 'node:crypto';
import { loadEnv } from '@inithium/api-config';
import { PageModel } from '@inithium/api-pages';
import { getSiteSettings } from '@inithium/api-settings';
import {
  assetUrl,
  readContentDocument,
  type Asset,
  type AssetKind,
  type AssetPurpose,
  type AssetUpdate,
  type AssetUsage,
  type ContentDocument,
  type StorageInfo,
} from '@inithium/shared-contracts';
import { failure, processUpload, type ProcessOptions } from './asset-processing.service';
import { AssetModel, type AssetDocument } from './assets.model';
import { driverFor, storageDriver, usedBytes } from './storage-drivers.service';

/** Maps a stored asset to the shape the API returns. */
export function toAsset(doc: AssetDocument): Asset {
  return {
    id: doc._id,
    purpose: doc.purpose,
    kind: doc.kind,
    contentType: doc.contentType,
    size: doc.size,
    ...(doc.width ? { width: doc.width } : {}),
    ...(doc.height ? { height: doc.height } : {}),
    filename: doc.filename,
    ...(doc.alt ? { alt: doc.alt } : {}),
    uploadedBy: doc.uploadedBy,
    driver: doc.driver,
    url: assetUrl(doc._id),
    createdAt: doc.createdAt.toISOString(),
  };
}

/** Where files go and how much room is left (decision 0098). */
export async function storageInfo(): Promise<StorageInfo> {
  const driver = storageDriver();
  const mode = loadEnv().STORAGE_MODE;
  return {
    mode,
    driver: driver.name,
    scalable: driver.capabilities.scalable,
    maxBytes: driver.capabilities.maxBytes,
    usedBytes: await usedBytes(driver.name),
    ...(driver.capabilities.quotaBytes ? { quotaBytes: driver.capabilities.quotaBytes } : {}),
    memberUploads: mode === 'cloud-all' && driver.capabilities.scalable,
  };
}

/** A new random asset id: 22 URL-safe characters, so addresses can't be guessed. */
const newId = () => randomBytes(16).toString('base64url');

/**
 * Stores an upload (decision 0098): processes it, checks the driver's limits and quota, writes the bytes, then the
 * record. Member uploads (avatars and banners) need a driver built to scale and STORAGE_MODE=cloud-all.
 */
export async function createAsset(
  file: { data: Buffer; originalName: string },
  input: { purpose: AssetPurpose; alt?: string; uploadedBy: string } & Pick<ProcessOptions, 'staff' | 'fontLicence'>,
): Promise<AssetDocument> {
  const driver = storageDriver();
  if (!input.staff) {
    const info = await storageInfo();
    if (!info.memberUploads) throw failure(409, 'Image uploads for profiles need cloud storage, which this site doesn’t use', 'file');
  }
  const processed = await processUpload(file.data, file.originalName, { purpose: input.purpose, staff: input.staff, fontLicence: input.fontLicence });
  if (processed.data.length > driver.capabilities.maxBytes) throw failure(413, 'This file is too big to store', 'file');
  const quota = driver.capabilities.quotaBytes;
  if (quota !== undefined && (await usedBytes(driver.name)) + processed.data.length > quota) {
    throw failure(507, 'The site’s file storage is full. Delete unused files, or ask your developer about cloud storage.', 'file');
  }

  const id = newId();
  await driver.put(id, processed.data, processed.contentType);
  try {
    return await AssetModel.create({
      _id: id,
      purpose: input.purpose,
      kind: processed.kind,
      contentType: processed.contentType,
      size: processed.data.length,
      width: processed.width,
      height: processed.height,
      filename: processed.filename,
      alt: input.alt || undefined,
      uploadedBy: input.uploadedBy,
      driver: driver.name,
      key: id,
    });
  } catch (error) {
    // Don't leave orphaned bytes behind if the record can't be written.
    await driver.remove(id).catch(() => undefined);
    throw error;
  }
}

export type AssetFilter = { purpose?: AssetPurpose; kind?: AssetKind; search?: string };

/** Assets, newest first, optionally filtered by purpose, kind or a search of their names and alt text. */
export async function listAssets(filter: AssetFilter): Promise<AssetDocument[]> {
  const query: Record<string, unknown> = {};
  if (filter.purpose) query['purpose'] = filter.purpose;
  if (filter.kind) query['kind'] = filter.kind;
  if (filter.search) {
    const pattern = new RegExp(filter.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    query['$or'] = [{ filename: pattern }, { alt: pattern }];
  }
  return AssetModel.find(query).sort({ createdAt: -1 }).limit(500);
}

export async function findAsset(id: string): Promise<AssetDocument | null> {
  return AssetModel.findById(id);
}

/** An asset's bytes, from whichever driver holds them. */
export async function readAssetBytes(doc: AssetDocument): Promise<Buffer | null> {
  return driverFor(doc.driver).get(doc.key);
}

/** Renames an asset or changes its default alt text; an empty alt removes it. */
export async function updateAsset(doc: AssetDocument, update: AssetUpdate): Promise<AssetDocument> {
  if (update.filename !== undefined) doc.filename = update.filename;
  if (update.alt !== undefined) doc.set('alt', update.alt || undefined);
  return doc.save();
}

/** Every image block's asset id in a content document. */
function imageIds(doc: ContentDocument | undefined): Set<string> {
  const ids = new Set<string>();
  for (const section of doc?.sections ?? []) {
    for (const column of section.columns) {
      for (const block of column.blocks) if (block.type === 'image') ids.add(block.assetId);
    }
  }
  return ids;
}

/**
 * Where an asset is used. Blocking uses (the site logo) stop it being deleted; others only warn, and the page shows
 * a placeholder once it's gone.
 */
export async function assetUsage(id: string): Promise<AssetUsage> {
  const places: AssetUsage['places'] = [];
  const settings = await getSiteSettings();
  if (settings.logo?.assetId === id) places.push({ label: 'Site settings: the logo', blocking: true });

  const pages = await PageModel.find({ content: { $exists: true } }, { title: 1, content: 1 });
  for (const page of pages) {
    const content = page.content as { draft?: unknown; published?: unknown } | undefined;
    const draft = imageIds(readContentDocument(content?.draft));
    const published = imageIds(readContentDocument(content?.published));
    if (published.has(id)) places.push({ label: `Page: ${page.title}`, blocking: false });
    else if (draft.has(id)) places.push({ label: `Page: ${page.title} (unpublished changes)`, blocking: false });
  }
  return { places };
}

/** Deletes an asset and its bytes, unless something that can't do without it uses it. */
export async function deleteAsset(doc: AssetDocument): Promise<void> {
  const usage = await assetUsage(doc._id);
  const blocking = usage.places.find((place) => place.blocking);
  if (blocking) throw failure(409, `This file is in use (${blocking.label}). Replace it there first.`);
  await driverFor(doc.driver).remove(doc.key);
  await doc.deleteOne();
}
