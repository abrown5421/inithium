import type { FontFamilyValue, FontWeightRange } from '@inithium/shared-contracts';
import { useGetFontFamiliesQuery, useGetSiteQuery } from '@inithium/shared-data-access';

export type FontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

const ALL_WEIGHTS: FontWeight[] = [100, 200, 300, 400, 500, 600, 700, 800, 900];

/** The weights Inithium's default fonts have: Bruno Ace SC one, Merriweather Sans a variable 300–800. */
const DEFAULT_WEIGHTS: Record<'display' | 'body', FontWeightRange[]> = {
  display: [{ min: 400, max: 400 }],
  body: [{ min: 300, max: 800 }],
};

/** The hundreds (100–900) that some file covers. */
export function weightsCovered(ranges: readonly FontWeightRange[]): FontWeight[] {
  return ALL_WEIGHTS.filter((weight) => ranges.some((range) => range.min <= weight && weight <= range.max));
}

/**
 * The weights a font has (decision 0115), so the editor only offers those: a library family's files, or for a theme
 * role the family the theme uses (or Inithium's default). Undefined (no font chosen) gives every weight.
 */
export function useFontWeights(font: FontFamilyValue | undefined): FontWeight[] {
  const { data: families = [] } = useGetFontFamiliesQuery();
  const { data: site } = useGetSiteQuery();
  if (font === undefined) return ALL_WEIGHTS;
  const familyId = typeof font === 'string' ? site?.settings.fonts?.[font] : font.familyId;
  const family = familyId ? families.find((candidate) => candidate.id === familyId) : undefined;
  if (family?.files.length) return weightsCovered(family.files.map((file) => file.weight));
  if (typeof font === 'string' && !familyId) return weightsCovered(DEFAULT_WEIGHTS[font]);
  return ALL_WEIGHTS;
}
