import { FontFamilyModel, findFontFamilyWithFile, markFontsChanged, type FontFamilyDocument } from '@inithium/api-fonts';
import { PageModel } from '@inithium/api-pages';
import { fontRolesUsing } from '@inithium/api-settings';
import {
  fontFilesOverlap,
  fontWeightLabel,
  MAX_FONT_FAMILIES,
  type AssetUsage,
  type FontFamilyCreate,
  type FontFamilyUpdate,
  type FontFileInfo,
} from '@inithium/shared-contracts';
import { failure } from './asset-processing.service';
import { readFontInfo } from './font-files.service';
import { AssetModel } from './assets.model';
import { fontInfo, readAssetBytes } from './assets.service';

type FamilyFile = Pick<FontFileInfo, 'weight' | 'style' | 'metrics'> & { assetId: string; filename: string; contentType: string };

const describe = (file: Pick<FamilyFile, 'weight' | 'style'>) => `${fontWeightLabel(file.weight)}${file.style === 'italic' ? ' italic' : ''}`;

/**
 * Turns chosen font assets into a family's files (decision 0111): each must be a font, belong to no other family, and
 * cover a weight and style no other file in the list does. Fonts uploaded before their details were stored are read now.
 */
async function familyFiles(assetIds: string[], familyId?: string): Promise<FamilyFile[]> {
  const files: FamilyFile[] = [];
  for (const assetId of assetIds) {
    const asset = await AssetModel.findById(assetId);
    if (!asset) throw failure(400, 'One of the chosen files no longer exists', 'assetIds');
    if (asset.kind !== 'font') throw failure(400, `${asset.filename} isn’t a font`, 'assetIds');

    let info = fontInfo(asset);
    if (!info) {
      const data = await readAssetBytes(asset);
      info = data ? (readFontInfo(data) ?? undefined) : undefined;
      if (!info) throw failure(400, `${asset.filename} can’t be read as a font`, 'assetIds');
      asset.set('font', info);
      await asset.save();
    }

    const holder = await findFontFamilyWithFile(assetId);
    if (holder && String(holder._id) !== familyId) throw failure(409, `${asset.filename} is already in the ${holder.name} family`, 'assetIds');

    const file: FamilyFile = { assetId, filename: asset.filename, contentType: asset.contentType, weight: info.weight, style: info.style, metrics: info.metrics };
    const clash = files.find((other) => fontFilesOverlap(other, file));
    if (clash) throw failure(400, `${clash.filename} and ${file.filename} both cover ${describe(file)}. Keep one of them.`, 'assetIds');
    files.push(file);
  }
  // Upright first, then by weight, so the list reads lightest to heaviest.
  return files.sort((a, b) => (a.style === b.style ? a.weight.min - b.weight.min : a.style === 'normal' ? -1 : 1));
}

/** Adds a family to the library, which holds at most six (decision 0111). */
export async function createFontFamily(input: FontFamilyCreate): Promise<FontFamilyDocument> {
  if ((await FontFamilyModel.countDocuments()) >= MAX_FONT_FAMILIES) {
    throw failure(409, `The font library is full: it holds at most ${MAX_FONT_FAMILIES} families. Remove one first.`);
  }
  const files = await familyFiles(input.assetIds);
  const created = await FontFamilyModel.create({ name: input.name, fallback: input.fallback, files });
  markFontsChanged();
  return created;
}

/** Changes a family's name, fallback or files. */
export async function updateFontFamily(doc: FontFamilyDocument, update: FontFamilyUpdate): Promise<FontFamilyDocument> {
  if (update.name !== undefined) doc.name = update.name;
  if (update.fallback !== undefined) doc.fallback = update.fallback;
  if (update.assetIds !== undefined) doc.set('files', await familyFiles(update.assetIds, String(doc._id)));
  const saved = await doc.save();
  markFontsChanged();
  return saved;
}

/** Whether a content document (draft or published) uses a family anywhere: a block's typography or restyled words. */
function usesFamily(value: unknown, familyId: string): boolean {
  if (Array.isArray(value)) return value.some((item) => usesFamily(item, familyId));
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return record['familyId'] === familyId || Object.values(record).some((item) => usesFamily(item, familyId));
}

/**
 * Where a family is used (decision 0111): the theme's roles, which stop it being removed, and pages whose content uses
 * it, which only warn (that text then draws in the body font).
 */
export async function fontFamilyUsage(familyId: string): Promise<AssetUsage> {
  const places: AssetUsage['places'] = (await fontRolesUsing(familyId)).map((role) => ({ label: `Site settings: the ${role} font`, blocking: true }));
  const pages = await PageModel.find({ content: { $exists: true } }, { title: 1, content: 1 });
  for (const page of pages) {
    const content = page.content as { draft?: unknown; published?: unknown } | undefined;
    if (usesFamily(content?.published, familyId)) places.push({ label: `Page: ${page.title}`, blocking: false });
    else if (usesFamily(content?.draft, familyId)) places.push({ label: `Page: ${page.title} (unpublished changes)`, blocking: false });
  }
  return { places };
}

/** Removes a family from the library, unless the theme uses it (409). Its files stay in Media as loose fonts. */
export async function deleteFontFamily(doc: FontFamilyDocument): Promise<void> {
  const roles = await fontRolesUsing(String(doc._id));
  if (roles.length) throw failure(409, `${doc.name} is the site’s ${roles.join(' and ')} font. Choose another in Settings first.`);
  await doc.deleteOne();
  markFontsChanged();
}

/**
 * Copies each family file's metrics from its asset where the family doesn't have them (families saved before decision
 * 0114), so their fallbacks are size-matched. Run on every start; does nothing once they're all there.
 */
export async function backfillFontFamilyMetrics(): Promise<void> {
  const families = await FontFamilyModel.find({ files: { $elemMatch: { metrics: { $exists: false } } } });
  for (const family of families) {
    for (const file of family.files) {
      if (file.metrics) continue;
      const asset = await AssetModel.findById(file.assetId);
      const info = asset ? fontInfo(asset) : undefined;
      if (info) file.metrics = info.metrics;
    }
    family.markModified('files');
    await family.save();
  }
  if (families.length) markFontsChanged();
}
