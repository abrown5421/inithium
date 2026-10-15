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
    /** The file's measurements, for sizing the family's fallback (decision 0114). Missing on families saved before. */
    metrics: fontMetricsSchema.optional(),
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

/** A family as the public site bundle carries it (decision 0114): enough to declare and draw it, nothing more. */
export const siteFontFamilySchema = z
  .object({
    id: z.string(),
    fallback: fontFallbackSchema,
    files: z.array(fontFamilyFileSchema.pick({ url: true, contentType: true, weight: true, style: true, metrics: true })),
  })
  .strict();

/**
 * The theme's fonts (decision 0111): the library family each role uses, by id. A role left out uses Inithium's default
 * (Bruno Ace SC for `display`, Merriweather Sans for `body`).
 */
export const themeFontsSchema = z
  .object({ display: z.string().min(1).optional(), body: z.string().min(1).optional() })
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

/**
 * A CSS `font-family` value: the quoted family name, its size-matched fallback face if it has one (decision 0114), then
 * the generic families for its fallback type.
 */
export const fontStack = (cssName: string, fallback: (typeof fontFallbacks)[number], fallbackFace?: string) =>
  `'${cssName}', ${fallbackFace ? `'${fallbackFace}', ` : ''}${FALLBACK_STACKS[fallback]}`;

/** One file of a family, as much as an `@font-face` rule needs. */
export type FontFaceSource = {
  url: string;
  contentType: string;
  weight: { min: number; max: number };
  style: 'normal' | 'italic';
  metrics?: { unitsPerEm: number; ascent: number; descent: number; lineGap: number; xAvgCharWidth?: number };
};

/** A family as the theme's CSS needs it: its id, fallback type and files. */
export type ThemeFontFamily = { id: string; fallback: (typeof fontFallbacks)[number]; files: readonly FontFaceSource[] };

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

/** A family's main file: the upright one covering 400 (regular), or else the one closest to it. */
export function mainFontFile<File extends FontFaceSource>(files: readonly File[]): File | undefined {
  const distance = (file: FontFaceSource) =>
    (file.style === 'italic' ? 10_000 : 0) + (file.weight.min <= 400 && 400 <= file.weight.max ? 0 : Math.min(Math.abs(file.weight.min - 400), Math.abs(file.weight.max - 400)));
  return [...files].sort((a, b) => distance(a) - distance(b))[0];
}

/**
 * The system font each fallback type is size-matched against, with its metrics (font units), and the names it's
 * installed under.
 */
const FALLBACK_FACES: Record<(typeof fontFallbacks)[number], { local: string[]; unitsPerEm: number; xAvgCharWidth: number }> = {
  sans: { local: ['Arial', 'ArialMT'], unitsPerEm: 2048, xAvgCharWidth: 904 },
  serif: { local: ['Times New Roman', 'TimesNewRomanPSMT'], unitsPerEm: 2048, xAvgCharWidth: 821 },
  mono: { local: ['Courier New', 'CourierNewPSMT'], unitsPerEm: 2048, xAvgCharWidth: 1229 },
};

/** The CSS name of a family's size-matched fallback face. */
export const fontFallbackFaceName = (familyId: string) => `${fontFamilyCssName(familyId)} Fallback`;

const percent = (value: number) => `${(value * 100).toFixed(2)}%`;

/**
 * A size-matched fallback face for a family (decision 0114): a system font scaled to the family's average character
 * width, with its ascent, descent and line gap, so text barely moves when the real font arrives. Empty when the
 * family's main file has no metrics.
 */
export function fallbackFaceCss(family: ThemeFontFamily): string {
  const metrics = mainFontFile(family.files)?.metrics;
  if (!metrics) return '';
  const face = FALLBACK_FACES[family.fallback];
  const sizeAdjust = metrics.xAvgCharWidth ? metrics.xAvgCharWidth / metrics.unitsPerEm / (face.xAvgCharWidth / face.unitsPerEm) : 1;
  const scale = metrics.unitsPerEm * sizeAdjust;
  return (
    `@font-face{font-family:'${fontFallbackFaceName(family.id)}';src:${face.local.map((name) => `local('${name}')`).join(',')};` +
    `size-adjust:${percent(sizeAdjust)};ascent-override:${percent(metrics.ascent / scale)};descent-override:${percent(metrics.descent / scale)};` +
    `line-gap-override:${percent(metrics.lineGap / scale)};}`
  );
}

/** A library family's full CSS `font-family` value, with its fallback face when it has one. */
export const familyFontStack = (family: ThemeFontFamily) =>
  fontStack(fontFamilyCssName(family.id), family.fallback, mainFontFile(family.files)?.metrics ? fontFallbackFaceName(family.id) : undefined);

/** The families the theme's roles use, if they exist and have files. */
export function themeFontFamilies(families: readonly ThemeFontFamily[], fonts: { display?: string; body?: string } | undefined) {
  const find = (id?: string) => (id ? families.find((family) => family.id === id && family.files.length > 0) : undefined);
  return { display: find(fonts?.display), body: find(fonts?.body) };
}

/**
 * The theme's font CSS (decisions 0111, 0114): `@font-face` rules for every library family and their fallback faces,
 * then `--font-display` / `--font-body` pointed at the families the theme uses. A role without a usable family keeps
 * Inithium's default. The api writes it into each app's page and the apps apply it again at runtime.
 */
export function themeFontsCss(families: readonly ThemeFontFamily[], fonts: { display?: string; body?: string } | undefined): string {
  const faces = families.flatMap((family) => [fontFaceCss(fontFamilyCssName(family.id), family.files), fallbackFaceCss(family)]).filter(Boolean);
  const roles = themeFontFamilies(families, fonts);
  const variables = (['display', 'body'] as const)
    .flatMap((role) => {
      const family = roles[role];
      return family ? [`--font-${role}:${familyFontStack(family)};`] : [];
    })
    .join('');
  return [...faces, ...(variables ? [`:root{${variables}}`] : [])].join('\n');
}

/** The theme fonts' main files, for the page to preload (decision 0114). */
export function themeFontPreloads(families: readonly ThemeFontFamily[], fonts: { display?: string; body?: string } | undefined): FontFaceSource[] {
  const roles = themeFontFamilies(families, fonts);
  const files = [roles.display, roles.body].flatMap((family) => {
    const file = family ? mainFontFile(family.files) : undefined;
    return file ? [file] : [];
  });
  return files.filter((file, index) => files.findIndex((other) => other.url === file.url) === index);
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
