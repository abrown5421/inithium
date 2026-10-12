import { z } from 'zod';
import { contentLinkSchema } from './content-links.schema';

/*
 * Rich text (decision 0093): the editor's (TipTap's) JSON document, limited to a fixed set of nodes and marks and
 * drawn with the UI library's Text components, never as HTML. Anything outside this set is rejected.
 */

export const richTextMarkSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('bold') }).strict(),
  z.object({ type: z.literal('italic') }).strict(),
  z.object({ type: z.literal('underline') }).strict(),
  z.object({ type: z.literal('link'), attrs: z.object({ link: contentLinkSchema }).strict() }).strict(),
]);

export const richTextTextSchema = z
  .object({
    type: z.literal('text'),
    text: z.string().min(1),
    marks: z.array(richTextMarkSchema).optional(),
  })
  .strict();

export const richTextHardBreakSchema = z.object({ type: z.literal('hardBreak') }).strict();

/** What a paragraph or heading holds: text runs and line breaks. */
export const richTextInlineSchema = z.discriminatedUnion('type', [richTextTextSchema, richTextHardBreakSchema]);

export const richTextParagraphSchema = z
  .object({ type: z.literal('paragraph'), content: z.array(richTextInlineSchema).optional() })
  .strict();

export const richTextHeadingSchema = z
  .object({
    type: z.literal('heading'),
    /** h2 to h4: the page's own title is its h1. */
    attrs: z.object({ level: z.union([z.literal(2), z.literal(3), z.literal(4)]) }).strict(),
    content: z.array(richTextInlineSchema).optional(),
  })
  .strict();

export const richTextBlockquoteSchema = z
  .object({ type: z.literal('blockquote'), content: z.array(richTextParagraphSchema).min(1) })
  .strict();

type Inline = z.infer<typeof richTextInlineSchema>;
type Paragraph = z.infer<typeof richTextParagraphSchema>;

/** A list item: paragraphs, and lists nested inside it. */
export type RichTextListItem = { type: 'listItem'; content: (Paragraph | RichTextList)[] };
export type RichTextList =
  | { type: 'bulletList'; content: RichTextListItem[] }
  | { type: 'orderedList'; attrs?: { start?: number }; content: RichTextListItem[] };

export const richTextListItemSchema: z.ZodType<RichTextListItem> = z.lazy(() =>
  z
    .object({
      type: z.literal('listItem'),
      content: z.array(z.union([richTextParagraphSchema, richTextListSchema])).min(1),
    })
    .strict(),
);

export const richTextListSchema: z.ZodType<RichTextList> = z.lazy(() =>
  z.union([
    z.object({ type: z.literal('bulletList'), content: z.array(richTextListItemSchema).min(1) }).strict(),
    z
      .object({
        type: z.literal('orderedList'),
        attrs: z.object({ start: z.number().int().min(0).optional() }).strict().optional(),
        content: z.array(richTextListItemSchema).min(1),
      })
      .strict(),
  ]),
);

/** The top-level parts of a rich text document. */
export const richTextNodeSchema = z.union([
  richTextParagraphSchema,
  richTextHeadingSchema,
  richTextBlockquoteSchema,
  richTextListSchema,
]);

export const richTextDocumentSchema = z
  .object({ type: z.literal('doc'), content: z.array(richTextNodeSchema).max(500) })
  .strict();

export type RichTextMark = z.infer<typeof richTextMarkSchema>;
export type RichTextInline = Inline;
export type RichTextParagraph = Paragraph;
export type RichTextHeading = z.infer<typeof richTextHeadingSchema>;
export type RichTextBlockquote = z.infer<typeof richTextBlockquoteSchema>;
export type RichTextNode = z.infer<typeof richTextNodeSchema>;
export type RichTextDocument = z.infer<typeof richTextDocumentSchema>;

/** A rich text document of plain paragraphs, one per line of the text given. */
export function richTextFromPlainText(text: string): RichTextDocument {
  return {
    type: 'doc',
    content: text
      .split('\n')
      .map((line): Paragraph => (line ? { type: 'paragraph', content: [{ type: 'text', text: line }] } : { type: 'paragraph' })),
  };
}
