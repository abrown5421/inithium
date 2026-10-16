import { z } from 'zod';
import { colorValueSchema } from '../ui/colors.schema';
import { fontFamilySchema, fontWeightSchema } from '../ui/typography.schema';
import { contentLinkSchema } from './content-links.schema';

/*
 * Rich text (decision 0093): the editor's (TipTap's) JSON document, limited to a fixed set of nodes and marks and
 * drawn with the UI library's Text components, never as HTML. Anything outside this set is rejected.
 */

/** The sizes the editor offers for restyled words, as ratios of the surrounding text (decision 0115). */
export const richTextSizePresets = [
  { value: 0.75, label: 'Small' },
  { value: 0.875, label: 'A little smaller' },
  { value: 1.25, label: 'A little larger' },
  { value: 1.5, label: 'Large' },
  { value: 2, label: 'Huge' },
] as const;

/**
 * Restyled words (decision 0115): a font (a role or a library family), a weight, a size relative to the surrounding
 * text, and a colour, at least one of them. A weight wins over bold.
 */
export const richTextStyleAttrsSchema = z
  .object({
    family: fontFamilySchema.optional(),
    weight: fontWeightSchema.optional(),
    size: z.number().min(0.5).max(3).optional(),
    color: colorValueSchema.optional(),
  })
  .strict()
  .refine((attrs) => Object.values(attrs).some((value) => value !== undefined), { error: 'Choose a font, weight, size or colour' });

export const richTextMarkSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('bold') }).strict(),
  z.object({ type: z.literal('italic') }).strict(),
  z.object({ type: z.literal('underline') }).strict(),
  z.object({ type: z.literal('link'), attrs: z.object({ link: contentLinkSchema }).strict() }).strict(),
  z.object({ type: z.literal('textStyle'), attrs: richTextStyleAttrsSchema }).strict(),
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
    /** h1 to h4. Rich text fields offer h2 to h4; a content page's Text may hold its title as h1 (decision 0116). */
    attrs: z.object({ level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]) }).strict(),
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

/** The formatting a rich text field can allow (decision 0102). Paragraphs and line breaks are always allowed. */
export const richTextFeatures = [
  'bold',
  'italic',
  'underline',
  'link',
  'heading',
  'bulletList',
  'orderedList',
  'blockquote',
  // Restyled words (decision 0115), each allowed separately.
  'fontFamily',
  'fontWeight',
  'fontSize',
  'textColor',
] as const;
export type RichTextFeature = (typeof richTextFeatures)[number];

/** Every text run and line break in a document, nested lists and quotes included. */
export function richTextInlineParts(doc: RichTextDocument): RichTextInline[] {
  const parts: RichTextInline[] = [];
  const fromList = (list: RichTextList): void => {
    for (const item of list.content) {
      for (const child of item.content) {
        if (child.type === 'paragraph') parts.push(...(child.content ?? []));
        else fromList(child);
      }
    }
  };
  for (const node of doc.content) {
    if (node.type === 'paragraph' || node.type === 'heading') parts.push(...(node.content ?? []));
    else if (node.type === 'blockquote') for (const paragraph of node.content) parts.push(...(paragraph.content ?? []));
    else fromList(node);
  }
  return parts;
}

/**
 * A document's length as people count it: its visible characters, each line break counting as one. Matches TipTap's
 * character count, so the editor's limit and the api's agree.
 */
export function richTextLength(doc: RichTextDocument): number {
  return richTextInlineParts(doc).reduce((total, part) => total + (part.type === 'text' ? [...part.text].length : 1), 0);
}

/** Whether a document has no visible text. */
export const richTextIsEmpty = (doc: RichTextDocument) => richTextInlineParts(doc).every((part) => part.type === 'hardBreak' || !part.text.trim());

/** The features a document uses, e.g. to check it against what a field allows. */
export function richTextFeaturesUsed(doc: RichTextDocument): Set<RichTextFeature> {
  const used = new Set<RichTextFeature>();
  const visitList = (list: RichTextList): void => {
    used.add(list.type);
    for (const item of list.content) for (const child of item.content) if (child.type !== 'paragraph') visitList(child);
  };
  for (const node of doc.content) {
    if (node.type === 'heading' || node.type === 'blockquote') used.add(node.type);
    else if (node.type !== 'paragraph') visitList(node);
  }
  for (const part of richTextInlineParts(doc)) {
    for (const mark of part.type === 'text' ? (part.marks ?? []) : []) {
      if (mark.type !== 'textStyle') {
        used.add(mark.type);
        continue;
      }
      if (mark.attrs.family !== undefined) used.add('fontFamily');
      if (mark.attrs.weight !== undefined) used.add('fontWeight');
      if (mark.attrs.size !== undefined) used.add('fontSize');
      if (mark.attrs.color !== undefined) used.add('textColor');
    }
  }
  return used;
}

/**
 * A rich text field's contract (decision 0102): a document using only the given features, at most `maxLength`
 * characters (counted as `richTextLength`), and, with `urlLinksOnly`, links to addresses but never to the site's
 * pages. Use it wherever such a field is saved, so the api enforces what the editor allows.
 */
export function restrictedRichTextSchema(options: { features: readonly RichTextFeature[]; maxLength?: number; urlLinksOnly?: boolean }) {
  const allowed = new Set(options.features);
  return richTextDocumentSchema.superRefine((doc, ctx) => {
    const refused = [...richTextFeaturesUsed(doc)].filter((feature) => !allowed.has(feature));
    if (refused.length) ctx.addIssue({ code: 'custom', message: `This text can’t use: ${refused.join(', ')}` });
    if (options.maxLength !== undefined && richTextLength(doc) > options.maxLength) {
      ctx.addIssue({ code: 'custom', message: `Use ${options.maxLength} characters or fewer` });
    }
    if (options.urlLinksOnly) {
      const pageLink = richTextInlineParts(doc).some((part) => part.type === 'text' && part.marks?.some((mark) => mark.type === 'link' && mark.attrs.link.type === 'page'));
      if (pageLink) ctx.addIssue({ code: 'custom', message: 'Links here must be web addresses' });
    }
  });
}
