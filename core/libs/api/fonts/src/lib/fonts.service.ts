import { assetUrl, fontMetricsSchema, type FontFamilyRecord, type FontMetrics, type SiteFontFamily } from '@inithium/shared-contracts';
import { FontFamilyModel, type FontFamilyDocument } from './fonts.model';

let version = 0;

/**
 * Notes that the library changed, so anything built from it (the font rules written into each app's page, decision
 * 0114) is rebuilt. Called by every change to families, and to settings' theme fonts.
 */
export function markFontsChanged(): void {
  version += 1;
}

/** How many times the library has changed since the api started. */
export const fontsVersion = () => version;

const fileMetrics = (value: unknown): FontMetrics | undefined => {
  const parsed = fontMetricsSchema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
};

/** Maps a stored family to the shape the API returns. */
export function toFontFamily(doc: FontFamilyDocument): FontFamilyRecord {
  return {
    id: String(doc._id),
    name: doc.name,
    fallback: doc.fallback,
    files: doc.files.map((file) => ({
      assetId: file.assetId,
      filename: file.filename,
      contentType: file.contentType,
      url: assetUrl(file.assetId),
      weight: { min: file.weight.min, max: file.weight.max },
      style: file.style,
      ...(fileMetrics(file.metrics) ? { metrics: fileMetrics(file.metrics) } : {}),
    })),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

/** A family as the public site bundle carries it (decision 0114). */
export function toSiteFontFamily(doc: FontFamilyDocument): SiteFontFamily {
  const { id, fallback, files } = toFontFamily(doc);
  return { id, fallback, files: files.map(({ url, contentType, weight, style, metrics }) => ({ url, contentType, weight, style, ...(metrics ? { metrics } : {}) })) };
}

/** Every family in the library, by name. */
export async function listFontFamilies(): Promise<FontFamilyDocument[]> {
  return FontFamilyModel.find().sort({ name: 1, _id: 1 });
}

/** One family, or null if the id isn't one. */
export async function findFontFamily(id: string): Promise<FontFamilyDocument | null> {
  if (!/^[a-f0-9]{24}$/i.test(id)) return null;
  return FontFamilyModel.findById(id);
}

/** The family holding a font file, if any (a file belongs to at most one). */
export async function findFontFamilyWithFile(assetId: string): Promise<FontFamilyDocument | null> {
  return FontFamilyModel.findOne({ 'files.assetId': assetId });
}

/** Takes a deleted font file out of its family. The family stays, even if that leaves it empty. */
export async function removeFontFile(assetId: string): Promise<void> {
  const { modifiedCount } = await FontFamilyModel.updateMany({ 'files.assetId': assetId }, { $pull: { files: { assetId } } });
  if (modifiedCount) markFontsChanged();
}

/** Keeps a family's copy of a font file's name in step when the asset is renamed. */
export async function renameFontFile(assetId: string, filename: string): Promise<void> {
  await FontFamilyModel.updateMany({ 'files.assetId': assetId }, { $set: { 'files.$[file].filename': filename } }, { arrayFilters: [{ 'file.assetId': assetId }] });
}
