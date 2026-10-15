import type { z } from 'zod';
import type { fontFamilySchema } from '../ui/typography.schema';
import type {
  fontFallbackSchema,
  fontFamilyCreateSchema,
  fontFamilyFileSchema,
  fontFamilyRecordSchema,
  fontFamilyUpdateSchema,
  fontFileInfoSchema,
  fontMetricsSchema,
  fontWeightRangeSchema,
  siteFontFamilySchema,
  themeFontsSchema,
} from './fonts.schema';

export type FontFallback = z.infer<typeof fontFallbackSchema>;
export type FontWeightRange = z.infer<typeof fontWeightRangeSchema>;
export type FontMetrics = z.infer<typeof fontMetricsSchema>;
export type FontFileInfo = z.infer<typeof fontFileInfoSchema>;
export type FontFamilyFile = z.infer<typeof fontFamilyFileSchema>;
export type FontFamilyRecord = z.infer<typeof fontFamilyRecordSchema>;
export type FontFamilyCreate = z.infer<typeof fontFamilyCreateSchema>;
export type FontFamilyUpdate = z.infer<typeof fontFamilyUpdateSchema>;
export type SiteFontFamily = z.infer<typeof siteFontFamilySchema>;
export type ThemeFonts = z.infer<typeof themeFontsSchema>;
/** A font family value: a theme role or `{ familyId }` (decision 0112). */
export type FontFamilyValue = z.infer<typeof fontFamilySchema>;
