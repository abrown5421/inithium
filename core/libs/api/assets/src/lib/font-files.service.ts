import { create, type Font } from 'fontkit';
import { fontFileInfoSchema, type FontFileInfo } from '@inithium/shared-contracts';

/** fontkit's view of the OS/2 table, as much of it as is read here. */
type Os2Table = { usWeightClass?: number; xAvgCharWidth?: number; fsSelection?: { italic?: boolean; oblique?: boolean } };

/**
 * What a font file covers, read from the file itself (decision 0111): its own family name, its weight (a variable
 * font's weight axis as a range) and style, and the metrics its fallback is sized from. Returns null if the file can't be
 * read as a font.
 */
export function readFontInfo(data: Buffer): FontFileInfo | null {
  let font: Font;
  try {
    const opened = create(data);
    // A collection (.ttc) holds several fonts; uploads must be single fonts.
    if (!('unitsPerEm' in opened)) return null;
    font = opened;
  } catch {
    return null;
  }

  const os2 = (font as unknown as Record<string, unknown>)['OS/2'] as Os2Table | undefined;
  const axis = font.variationAxes?.['wght'];
  const fixed = os2?.usWeightClass && os2.usWeightClass >= 1 && os2.usWeightClass <= 1000 ? os2.usWeightClass : 400;
  const weight = axis ? { min: Math.round(axis.min), max: Math.round(axis.max) } : { min: fixed, max: fixed };
  const italic =
    os2?.fsSelection?.italic === true || os2?.fsSelection?.oblique === true || /italic|oblique/i.test(font.subfamilyName ?? '');
  const family = (font.getName?.('preferredFamily', 'en') ?? font.familyName ?? '').trim() || 'Untitled font';

  const parsed = fontFileInfoSchema.safeParse({
    family: family.slice(0, 80),
    weight,
    style: italic ? 'italic' : 'normal',
    metrics: {
      unitsPerEm: font.unitsPerEm,
      ascent: Math.abs(font.ascent),
      descent: Math.abs(font.descent),
      lineGap: font.lineGap,
      ...(os2?.xAvgCharWidth && os2.xAvgCharWidth > 0 ? { xAvgCharWidth: os2.xAvgCharWidth } : {}),
    },
  });
  return parsed.success ? parsed.data : null;
}
