import { FontFamilyModel, findFontFamilyWithFile, type FontFamilyDocument } from '@inithium/api-fonts';
import {
  fontFilesOverlap,
  fontWeightLabel,
  MAX_FONT_FAMILIES,
  type FontFamilyCreate,
  type FontFamilyUpdate,
  type FontFileInfo,
} from '@inithium/shared-contracts';
import { failure } from './asset-processing.service';
import { readFontInfo } from './font-files.service';
import { AssetModel } from './assets.model';
import { fontInfo, readAssetBytes } from './assets.service';

type FamilyFile = { assetId: string; filename: string; contentType: string; weight: FontFileInfo['weight']; style: FontFileInfo['style'] };

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

    const file: FamilyFile = { assetId, filename: asset.filename, contentType: asset.contentType, weight: info.weight, style: info.style };
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
  return FontFamilyModel.create({ name: input.name, fallback: input.fallback, files });
}

/** Changes a family's name, fallback or files. */
export async function updateFontFamily(doc: FontFamilyDocument, update: FontFamilyUpdate): Promise<FontFamilyDocument> {
  if (update.name !== undefined) doc.name = update.name;
  if (update.fallback !== undefined) doc.fallback = update.fallback;
  if (update.assetIds !== undefined) doc.set('files', await familyFiles(update.assetIds, String(doc._id)));
  return doc.save();
}

/** Removes a family from the library. Its files stay in Media as loose fonts. */
export async function deleteFontFamily(doc: FontFamilyDocument): Promise<void> {
  await doc.deleteOne();
}
