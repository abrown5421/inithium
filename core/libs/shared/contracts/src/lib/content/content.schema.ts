import { z } from 'zod';
import { checkContentTree, contentElementSchema } from './content-elements.schema';
import { upgradeContentV1 } from './v1/content-v1-upgrade.service';
import { contentDocumentV1Schema } from './v1/content-v1.schema';

/** The current version of the content format. Bump it, with an upgrade in `readContentDocument`, when it changes. */
export const CONTENT_SCHEMA_VERSION = 2;

/**
 * A content page's content (decision 0116): its elements, in order. The page itself is the root, a vertical column
 * the elements stack in.
 */
export const contentDocumentSchema = z
  .object({
    schemaVersion: z.literal(CONTENT_SCHEMA_VERSION),
    elements: z.array(z.unknown()).superRefine(checkContentTree).pipe(z.array(contentElementSchema)),
  })
  .strict();

/** An empty page. */
export const emptyContentDocument = (): z.infer<typeof contentDocumentSchema> => ({ schemaVersion: CONTENT_SCHEMA_VERSION, elements: [] });

/**
 * Reads stored content of any version, upgrading older versions to the current one (decisions 0093, 0116). Returns
 * undefined when it isn't valid content, or when upgraded content breaks the current limits.
 */
export function readContentDocument(stored: unknown): z.infer<typeof contentDocumentSchema> | undefined {
  const version = typeof stored === 'object' && stored !== null ? (stored as { schemaVersion?: unknown }).schemaVersion : undefined;
  if (version === 1) {
    const v1 = contentDocumentV1Schema.safeParse(stored).data;
    return v1 ? contentDocumentSchema.safeParse(upgradeContentV1(v1)).data : undefined;
  }
  return contentDocumentSchema.safeParse(stored).data;
}

/** A content page's working draft and its published version, which is what visitors see. */
export const pageContentSchema = z
  .object({
    draft: contentDocumentSchema,
    /** Null until the draft is first published. */
    published: contentDocumentSchema.nullable(),
    /** When the draft was last saved, and by whom (a user id). */
    draftSavedAt: z.iso.datetime().optional(),
    draftSavedBy: z.string().optional(),
    /** When the draft was last published, and by whom (a user id). */
    publishedAt: z.iso.datetime().optional(),
    publishedBy: z.string().optional(),
  })
  .strict();

/** `PUT /api/pages/:id/content`: the editor saves the whole draft (decision 0093). */
export const pageDraftSaveSchema = z.object({ draft: contentDocumentSchema }).strict();
