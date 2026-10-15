import { z } from 'zod';

/*
 * Font families (decision 0111): uploaded font files grouped into named families in a library, which the theme's
 * `display` and `body` roles and page content pick from. Every family is served under an internal name, never its own.
 */

/** The library holds at most this many uploaded families; Inithium's two defaults are built in and don't count. */
export const MAX_FONT_FAMILIES = 6;

/** A family's file list holds at most this many files (a weight and style each). */
export const MAX_FONT_FAMILY_FILES = 20;

/** The generic family a font falls back to while it loads or if it fails. */
export const fontFallbacks = ['sans', 'serif', 'mono'] as const;
export const fontFallbackSchema = z.enum(fontFallbacks);

/** The weights a font file covers: one value (`min === max`), or a variable font's range. */
export const fontWeightRangeSchema = z
  .object({ min: z.number().int().min(1).max(1000), max: z.number().int().min(1).max(1000) })
  .strict()
  .refine((range) => range.min <= range.max, { error: 'The lowest weight must not be above the highest' });

/** A font file's own measurements, in font units, for sizing its fallback to match (decision 0114). */
export const fontMetricsSchema = z
  .object({
    unitsPerEm: z.number().positive(),
    /** Above the baseline, positive. */
    ascent: z.number(),
    /** Below the baseline, positive. */
    descent: z.number(),
    lineGap: z.number(),
    /** The average character width, if the font records it. */
    xAvgCharWidth: z.number().positive().optional(),
  })
  .strict();

/** What a font file is, read from the file itself when it's uploaded (decision 0111). Stored on its asset. */
export const fontFileInfoSchema = z
  .object({
    /** The family name the file gives itself, used to suggest a family's name. */
    family: z.string(),
    weight: fontWeightRangeSchema,
    style: z.enum(['normal', 'italic']),
    metrics: fontMetricsSchema,
  })
  .strict();

/** One file in a family: the font asset and what it covers. */
export const fontFamilyFileSchema = z
  .object({
    assetId: z.string(),
    filename: z.string(),
    contentType: z.string(),
    url: z.string(),
    weight: fontWeightRangeSchema,
    style: z.enum(['normal', 'italic']),
  })
  .strict();

/** A font family as the API returns it. */
export const fontFamilyRecordSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    fallback: fontFallbackSchema,
    files: z.array(fontFamilyFileSchema),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .strict();

const familyNameSchema = z.string().trim().min(1, { error: 'Enter a name' }).max(80, { error: 'Use 80 characters or fewer' });
const familyFilesSchema = z
  .array(z.string().min(1))
  .min(1, { error: 'Add at least one font file' })
  .max(MAX_FONT_FAMILY_FILES, { error: `A family can hold at most ${MAX_FONT_FAMILY_FILES} files` })
  .refine((ids) => new Set(ids).size === ids.length, { error: 'A file can only be added once' });

/** `POST /api/fonts`: a new family from uploaded font files. Each file's weight and style come from the file. */
export const fontFamilyCreateSchema = z
  .object({ name: familyNameSchema, fallback: fontFallbackSchema, assetIds: familyFilesSchema })
  .strict();

/** `PATCH /api/fonts/:id`: any of a family's name, fallback or files (the whole new list). */
export const fontFamilyUpdateSchema = fontFamilyCreateSchema.partial().strict();

/** The CSS family name a library family is served under (decision 0111), never the font's own name. */
export const fontFamilyCssName = (familyId: string) => `Inithium Font ${familyId}`;

/** Generic families, by fallback type, ending a family's CSS stack. */
const FALLBACK_STACKS: Record<(typeof fontFallbacks)[number], string> = {
  sans: 'ui-sans-serif, system-ui, sans-serif',
  serif: 'ui-serif, Georgia, serif',
  mono: 'ui-monospace, SFMono-Regular, Menlo, monospace',
};

/** A CSS `font-family` value: the quoted family name, then the generic families for its fallback type. */
export const fontStack = (cssName: string, fallback: (typeof fontFallbacks)[number]) => `'${cssName}', ${FALLBACK_STACKS[fallback]}`;

/** One file of a family, as much as an `@font-face` rule needs. */
export type FontFaceSource = { url: string; contentType: string; weight: { min: number; max: number }; style: 'normal' | 'italic' };

/**
 * `@font-face` rules declaring files under one CSS family name. Browsers download a declared file only when text uses
 * it, so declaring every family costs nothing on pages that don't (decision 0114).
 */
export function fontFaceCss(cssName: string, files: readonly FontFaceSource[]): string {
  return files
    .map((file) => {
      const format = file.contentType === 'font/woff' ? 'woff' : 'woff2';
      const weight = file.weight.min === file.weight.max ? String(file.weight.min) : `${file.weight.min} ${file.weight.max}`;
      return `@font-face{font-family:'${cssName}';src:url('${file.url}') format('${format}');font-weight:${weight};font-style:${file.style};font-display:swap;}`;
    })
    .join('\n');
}

/** How the CMS names a weight, e.g. 'Bold 700' or 'Variable 300–800'. */
export function fontWeightLabel(weight: { min: number; max: number }): string {
  if (weight.min !== weight.max) return `Variable ${weight.min}–${weight.max}`;
  const names: Record<number, string> = { 100: 'Thin', 200: 'Extra light', 300: 'Light', 400: 'Regular', 500: 'Medium', 600: 'Semibold', 700: 'Bold', 800: 'Extra bold', 900: 'Black' };
  const name = names[Math.round(weight.min / 100) * 100];
  return name ? `${name} ${weight.min}` : String(weight.min);
}

/** Whether two files of a family overlap: the same style and weights in common. */
export const fontFilesOverlap = (a: Pick<FontFaceSource, 'weight' | 'style'>, b: Pick<FontFaceSource, 'weight' | 'style'>) =>
  a.style === b.style && a.weight.min <= b.weight.max && b.weight.min <= a.weight.max;
