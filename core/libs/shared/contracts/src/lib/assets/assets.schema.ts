import { z } from 'zod';

/** Every stored file is at most this big, in every storage mode (decision 0098). */
export const MAX_ASSET_BYTES = 2 * 1024 * 1024;

/**
 * Where files live (decision 0098): `database` keeps them in the site's own MongoDB (no third party); `cloud-staff`
 * puts staff uploads in Cloudflare R2 and allows no member uploads; `cloud-all` puts everyone's in R2, members' avatars
 * and banners included.
 */
export const storageModes = ['database', 'cloud-staff', 'cloud-all'] as const;
export const storageModeSchema = z.enum(storageModes);

/** What an asset is for. Members may only upload avatars and banners; everything else is staff content. */
export const assetPurposes = ['content', 'logo', 'favicon', 'font', 'document', 'avatar', 'banner'] as const;
export const assetPurposeSchema = z.enum(assetPurposes);

/** The broad kind of file, from its type. */
export const assetKinds = ['image', 'font', 'document', 'audio', 'video'] as const;
export const assetKindSchema = z.enum(assetKinds);

type AssetKind = (typeof assetKinds)[number];

/**
 * Every type that may be stored (decision 0098), by MIME type: its kind, the file extensions it's recognised by, and
 * whether browsers show it (inline) or download it. Files are checked by their contents, not their names.
 */
export const assetFileTypes: Record<string, { kind: AssetKind; extensions: readonly string[]; inline: boolean; label: string }> = {
  'image/png': { kind: 'image', extensions: ['png'], inline: true, label: 'PNG image' },
  'image/jpeg': { kind: 'image', extensions: ['jpg', 'jpeg'], inline: true, label: 'JPEG image' },
  'image/webp': { kind: 'image', extensions: ['webp'], inline: true, label: 'WebP image' },
  'image/gif': { kind: 'image', extensions: ['gif'], inline: true, label: 'GIF image' },
  'image/avif': { kind: 'image', extensions: ['avif'], inline: true, label: 'AVIF image' },
  'image/svg+xml': { kind: 'image', extensions: ['svg'], inline: true, label: 'SVG image' },
  'image/x-icon': { kind: 'image', extensions: ['ico'], inline: true, label: 'Icon' },
  'font/woff2': { kind: 'font', extensions: ['woff2', 'ttf', 'otf'], inline: true, label: 'WOFF2 font' },
  'font/woff': { kind: 'font', extensions: ['woff'], inline: true, label: 'WOFF font' },
  'application/pdf': { kind: 'document', extensions: ['pdf'], inline: true, label: 'PDF' },
  'text/plain': { kind: 'document', extensions: ['txt'], inline: false, label: 'Text file' },
  'text/csv': { kind: 'document', extensions: ['csv'], inline: false, label: 'CSV file' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    kind: 'document',
    extensions: ['docx'],
    inline: false,
    label: 'Word document',
  },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
    kind: 'document',
    extensions: ['xlsx'],
    inline: false,
    label: 'Excel spreadsheet',
  },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': {
    kind: 'document',
    extensions: ['pptx'],
    inline: false,
    label: 'PowerPoint presentation',
  },
  'audio/mpeg': { kind: 'audio', extensions: ['mp3'], inline: true, label: 'MP3 audio' },
  'video/mp4': { kind: 'video', extensions: ['mp4'], inline: true, label: 'MP4 video' },
};

/** The kinds each purpose accepts. */
export const assetPurposeKinds: Record<(typeof assetPurposes)[number], readonly AssetKind[]> = {
  content: ['image', 'document', 'audio', 'video'],
  logo: ['image'],
  favicon: ['image'],
  font: ['font'],
  document: ['document'],
  avatar: ['image'],
  banner: ['image'],
};

/** Every accepted file extension, for a file picker's `accept`, optionally only those of some kinds. */
export function acceptedExtensions(kinds: readonly AssetKind[] = assetKinds): string[] {
  return Object.values(assetFileTypes)
    .filter((type) => kinds.includes(type.kind))
    .flatMap((type) => type.extensions.map((extension) => `.${extension}`));
}

/** An asset as the API returns it (decision 0098). Documents store its `id`; `url` is where it's served. */
export const assetSchema = z
  .object({
    id: z.string(),
    purpose: assetPurposeSchema,
    kind: assetKindSchema,
    contentType: z.string(),
    /** In bytes, as stored (after processing). */
    size: z.number().int().nonnegative(),
    /** For images, in px. */
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
    /** The file's name, as uploaded (with its stored extension). */
    filename: z.string(),
    /** Describes an image for screen readers; each use can override it. */
    alt: z.string().optional(),
    /** The id of the user who uploaded it. */
    uploadedBy: z.string(),
    /** Which storage holds the bytes. */
    driver: z.enum(['database', 'r2']),
    url: z.string(),
    createdAt: z.iso.datetime(),
  })
  .strict();

/** `PATCH /api/assets/:id`: a new name or default alt text. An empty alt removes it. */
export const assetUpdateSchema = z
  .object({
    filename: z.string().trim().min(1, { error: 'Enter a name' }).max(200, { error: 'Use 200 characters or fewer' }),
    alt: z.string().trim().max(300, { error: 'Use 300 characters or fewer' }),
  })
  .partial()
  .strict();

/** The fields sent with an upload (alongside the file itself). */
export const assetUploadFieldsSchema = z
  .object({
    purpose: assetPurposeSchema,
    alt: z.string().trim().max(300, { error: 'Use 300 characters or fewer' }).optional(),
    /** Fonts only: the uploader confirms they may use the font on the web. */
    fontLicence: z.enum(['true']).optional(),
  })
  .strict();

/** What the CMS shows about storage: the mode, the limits and how much is used (decision 0098). */
export const storageInfoSchema = z
  .object({
    mode: storageModeSchema,
    driver: z.enum(['database', 'r2']),
    /** Whether the driver is built to scale (R2), which member uploads require. */
    scalable: z.boolean(),
    maxBytes: z.number().int().positive(),
    /** Bytes stored by the current driver. */
    usedBytes: z.number().int().nonnegative(),
    /** The database driver's total cap, in bytes; none for R2. */
    quotaBytes: z.number().int().positive().optional(),
    /** Whether members may upload their own avatar and banner. */
    memberUploads: z.boolean(),
  })
  .strict();

/** Where an asset is used, so deleting it can warn first. */
export const assetUsageSchema = z
  .object({
    /** Human-readable places, e.g. 'Site settings: logo' or 'Page: About us'. */
    places: z.array(z.object({ label: z.string(), blocking: z.boolean() }).strict()),
  })
  .strict();

/** Where an asset is served from, by its id (decision 0028). Documents store the id and build the address with this. */
export const assetUrl = (id: string) => `/api/assets/${encodeURIComponent(id)}`;
