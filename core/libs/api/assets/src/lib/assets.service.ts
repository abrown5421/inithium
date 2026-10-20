import { randomBytes } from 'node:crypto';
import { loadEnv } from '@inithium/api-config';
import { findFontFamilyWithFile, removeFontFile, renameFontFile } from '@inithium/api-fonts';
import { PageModel } from '@inithium/api-pages';
import { fontRolesUsing, getSiteSettings } from '@inithium/api-settings';
import { clearProfileImage, findUsersWithProfileImage } from '@inithium/api-users';
import {
  assetFileTypes,
  assetUrl,
  fontFileInfoSchema,
  publicProfileName,
  contentReferences,
  readContentDocument,
  type Asset,
  type AssetKind,
  type AssetPurpose,
  type AssetUpdate,
  type AssetUsage,
  type ContentDocument,
  type FontFileInfo,
  type StorageInfo,
} from '@inithium/shared-contracts';
import { failure, processUpload, type ProcessOptions } from './asset-processing.service';
import { AssetModel, type AssetDocument } from './assets.model';
import { driverFor, storageDriver, usedBytes } from './storage-drivers.service';

/** A font asset's stored file details, if it has valid ones (fonts uploaded before decision 0111 have none until read). */
export function fontInfo(doc: AssetDocument): FontFileInfo | undefined {
  const parsed = fontFileInfoSchema.safeParse(doc.font);
  return parsed.success ? parsed.data : undefined;
}

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
    ...(fontInfo(doc) ? { font: fontInfo(doc) } : {}),
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

/** How a file of a type is sent: inline for types browsers show safely, otherwise as a download with its name. */
export function contentDisposition(contentType: string, filename: string): string {
  const inline = assetFileTypes[contentType]?.inline ?? false;
  return `${inline ? 'inline' : 'attachment'}; filename*=UTF-8''${encodeURIComponent(filename)}`;
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
  await driver.put(id, processed.data, { contentType: processed.contentType, disposition: contentDisposition(processed.contentType, processed.filename) });
  try {
    return await AssetModel.create({
      _id: id,
      purpose: input.purpose,
      kind: processed.kind,
      contentType: processed.contentType,
      size: processed.data.length,
      width: processed.width,
      height: processed.height,
      font: processed.font,
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

export type AssetFilter = { group?: 'staff' | 'members'; purpose?: AssetPurpose; kind?: AssetKind; search?: string };

/** The purposes of members' own uploads, kept apart from staff files on the Media screen. */
export const MEMBER_PURPOSES: AssetPurpose[] = ['avatar', 'banner'];

/**
 * Assets, newest first: staff files by default, or members' avatars and banners (`group: 'members'`), optionally
 * filtered by purpose, kind or a search of their names and alt text.
 */
export async function listAssets(filter: AssetFilter): Promise<AssetDocument[]> {
  const query: Record<string, unknown> = {
    purpose: filter.group === 'members' ? { $in: MEMBER_PURPOSES } : { $nin: MEMBER_PURPOSES },
  };
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

/** The asset's direct address on its driver's public host, if it has one (R2 with R2_PUBLIC_URL). */
export function assetPublicUrl(doc: AssetDocument): string | undefined {
  return driverFor(doc.driver).publicUrl?.(doc.key);
}

/** Renames an asset or changes its default alt text; an empty alt removes it. */
export async function updateAsset(doc: AssetDocument, update: AssetUpdate): Promise<AssetDocument> {
  if (update.filename !== undefined) doc.filename = update.filename;
  if (update.alt !== undefined) doc.set('alt', update.alt || undefined);
  const saved = await doc.save();
  if (update.filename !== undefined && saved.kind === 'font') await renameFontFile(saved._id, saved.filename);
  return saved;
}

/** Every asset a content document shows, by its elements' declared references (decision 0116). */
const imageIds = (doc: ContentDocument | undefined): Set<string> => contentReferences(doc).assetIds;

/**
 * Where an asset is used. Blocking uses (the site's logos and favicon) stop it being deleted; others only warn, and the page shows
 * a placeholder once it's gone.
 */
export async function assetUsage(id: string): Promise<AssetUsage> {
  const places: AssetUsage['places'] = [];
  const settings = await getSiteSettings();
  if (settings.logo?.assetId === id) places.push({ label: 'Site settings: the logo', blocking: true });
  if (settings.logoDark?.assetId === id) places.push({ label: 'Site settings: the dark mode logo', blocking: true });
  if (settings.favicon?.assetId === id) places.push({ label: 'Site settings: the favicon', blocking: true });

  // A font family's file: deleting it takes it out of the family (decision 0111). A theme font's only file can't go.
  const family = await findFontFamilyWithFile(id);
  if (family) {
    const roles = await fontRolesUsing(String(family._id));
    const lastThemeFile = roles.length > 0 && family.files.length === 1;
    places.push({
      label: `Font family: ${family.name}${roles.length ? ` (the site’s ${roles.join(' and ')} font${lastThemeFile ? ', and its only file' : ''})` : ''}`,
      blocking: lastThemeFile,
    });
  }

  const pages = await PageModel.find({ content: { $exists: true } }, { title: 1, content: 1 });
  for (const page of pages) {
    const content = page.content as { draft?: unknown; published?: unknown } | undefined;
    const draft = imageIds(readContentDocument(content?.draft));
    const published = imageIds(readContentDocument(content?.published));
    if (published.has(id)) places.push({ label: `Page: ${page.title}`, blocking: false });
    else if (draft.has(id)) places.push({ label: `Page: ${page.title} (unpublished changes)`, blocking: false });
  }

  // Members' profiles: deleting one (moderation) puts their generated picture back.
  for (const user of await findUsersWithProfileImage(id)) {
    const what = user.profile?.avatarAssetId === id ? 'avatar' : 'banner';
    places.push({ label: `Profile: ${publicProfileName(user.profile ?? {})} (${what})`, blocking: false });
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
  await clearProfileImage(doc._id);
  await removeFontFile(doc._id);
}

/**
 * Checks a member may show an upload on their profile (decision 0098): it exists, it's theirs, and it was uploaded
 * as that kind of picture. Throws a 400 naming the field otherwise.
 */
export async function checkProfileImage(userId: string, assetId: string, purpose: 'avatar' | 'banner'): Promise<void> {
  const field = purpose === 'avatar' ? 'avatarAssetId' : 'bannerAssetId';
  const asset = await AssetModel.findById(assetId);
  if (!asset || asset.uploadedBy !== userId || asset.purpose !== purpose) {
    throw failure(400, `That picture can’t be used as your ${purpose}`, field);
  }
}

/**
 * Deletes the avatars and banners these accounts uploaded, for deleting the accounts (decision 0100). Files staff
 * uploaded for the site (logos, page images and so on) are site content and stay.
 */
export async function deleteMemberUploads(userIds: string[]): Promise<void> {
  const uploads = await AssetModel.find({ uploadedBy: { $in: userIds }, purpose: { $in: MEMBER_PURPOSES } });
  for (const asset of uploads) {
    await driverFor(asset.driver).remove(asset.key);
    await asset.deleteOne();
  }
}

/** Deletes a member's replaced or removed profile picture. Its own deletion never blocks, so this doesn't either. */
export async function releaseProfileImage(assetId: string): Promise<void> {
  const asset = await AssetModel.findById(assetId);
  if (!asset || !MEMBER_PURPOSES.includes(asset.purpose)) return;
  if ((await findUsersWithProfileImage(assetId)).length > 0) return;
  await driverFor(asset.driver).remove(asset.key);
  await asset.deleteOne();
}
