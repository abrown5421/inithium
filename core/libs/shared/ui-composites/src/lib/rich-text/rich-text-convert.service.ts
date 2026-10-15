import type { JSONContent } from '@tiptap/react';
import {
  richTextDocumentSchema,
  type ContentLink,
  type RichTextDocument,
  type RichTextInline,
  type RichTextList,
  type RichTextListItem,
  type RichTextMark,
  type RichTextNode,
  type RichTextParagraph,
} from '@inithium/shared-contracts';
import { checkedStyleAttrs, RICH_TEXT_STYLE_MARK } from './rich-text-style.extension';

/** TipTap stores links as addresses; a link to a page is written as this scheme plus the page's id. */
export const PAGE_LINK_SCHEME = 'inithium-page';

/** A content link as TipTap's link attributes. */
export function linkToAttrs(link: ContentLink): { href: string; target: string | null } {
  return link.type === 'page'
    ? { href: `${PAGE_LINK_SCHEME}:${link.pageId}`, target: null }
    : { href: link.href, target: link.newTab ? '_blank' : null };
}

/** TipTap's link attributes as a content link, or undefined for an address we don't allow. */
export function attrsToLink(attrs: Record<string, unknown> | undefined): ContentLink | undefined {
  const href = typeof attrs?.['href'] === 'string' ? attrs['href'] : '';
  if (href.startsWith(`${PAGE_LINK_SCHEME}:`)) {
    const pageId = href.slice(PAGE_LINK_SCHEME.length + 1);
    return pageId ? { type: 'page', pageId } : undefined;
  }
  if (!/^(https?:\/\/|mailto:|tel:)/i.test(href)) return undefined;
  return { type: 'url', href, ...(attrs?.['target'] === '_blank' ? { newTab: true } : {}) };
}

// --- Ours → TipTap ---

function markToTiptap(mark: RichTextMark): NonNullable<JSONContent['marks']>[number] {
  if (mark.type === 'link') return { type: 'link', attrs: linkToAttrs(mark.attrs.link) };
  if (mark.type === 'textStyle') return { type: RICH_TEXT_STYLE_MARK, attrs: { ...mark.attrs } };
  return { type: mark.type };
}

function inlineToTiptap(parts: RichTextInline[] | undefined): JSONContent[] | undefined {
  if (!parts?.length) return undefined;
  return parts.map((part) =>
    part.type === 'hardBreak'
      ? { type: 'hardBreak' }
      : {
          type: 'text',
          text: part.text,
          ...(part.marks?.length
            ? { marks: part.marks.map(markToTiptap) }
            : {}),
        },
  );
}

const paragraphToTiptap = (node: RichTextParagraph): JSONContent => ({ type: 'paragraph', content: inlineToTiptap(node.content) });

function listToTiptap(list: RichTextList): JSONContent {
  const items = list.content.map((item) => ({
    type: 'listItem',
    content: item.content.map((child) => (child.type === 'paragraph' ? paragraphToTiptap(child) : listToTiptap(child))),
  }));
  return list.type === 'orderedList'
    ? { type: 'orderedList', attrs: { start: list.attrs?.start ?? 1 }, content: items }
    : { type: 'bulletList', content: items };
}

/** Our rich text document as TipTap's. */
export function richTextToTiptap(doc: RichTextDocument): JSONContent {
  const content = doc.content.map((node): JSONContent => {
    switch (node.type) {
      case 'paragraph':
        return paragraphToTiptap(node);
      case 'heading':
        return { type: 'heading', attrs: { level: node.attrs.level }, content: inlineToTiptap(node.content) };
      case 'blockquote':
        return { type: 'blockquote', content: node.content.map(paragraphToTiptap) };
      default:
        return listToTiptap(node);
    }
  });
  return { type: 'doc', content: content.length ? content : [{ type: 'paragraph' }] };
}

// --- TipTap → ours: anything outside the allowed set is dropped or flattened into text. ---

const MARKS = new Set(['bold', 'italic', 'underline']);

function marksFrom(marks: JSONContent['marks']): RichTextMark[] | undefined {
  const result: RichTextMark[] = [];
  for (const mark of marks ?? []) {
    if (MARKS.has(mark.type)) result.push({ type: mark.type as 'bold' | 'italic' | 'underline' });
    if (mark.type === 'link') {
      const link = attrsToLink(mark.attrs);
      if (link) result.push({ type: 'link', attrs: { link } });
    }
    if (mark.type === RICH_TEXT_STYLE_MARK) {
      const attrs = checkedStyleAttrs(mark.attrs);
      if (attrs) result.push({ type: 'textStyle', attrs });
    }
  }
  return result.length ? result : undefined;
}

/** A node's inline content: text runs and line breaks, from anything nested inside it. */
function inlineFrom(node: JSONContent): RichTextInline[] | undefined {
  const parts: RichTextInline[] = [];
  const walk = (child: JSONContent) => {
    if (child.type === 'text' && child.text) {
      const marks = marksFrom(child.marks);
      parts.push({ type: 'text', text: child.text, ...(marks ? { marks } : {}) });
    } else if (child.type === 'hardBreak') {
      parts.push({ type: 'hardBreak' });
    } else {
      child.content?.forEach(walk);
    }
  };
  node.content?.forEach(walk);
  return parts.length ? parts : undefined;
}

const paragraphFrom = (node: JSONContent): RichTextParagraph => {
  const content = inlineFrom(node);
  return content ? { type: 'paragraph', content } : { type: 'paragraph' };
};

function listFrom(node: JSONContent): RichTextList | undefined {
  const items: RichTextListItem[] = (node.content ?? [])
    .filter((item) => item.type === 'listItem')
    .map((item) => {
      const children = (item.content ?? []).map((child) =>
        child.type === 'bulletList' || child.type === 'orderedList' ? (listFrom(child) ?? paragraphFrom(child)) : paragraphFrom(child),
      );
      return { type: 'listItem', content: children.length ? children : [{ type: 'paragraph' }] };
    });
  if (!items.length) return undefined;
  if (node.type === 'orderedList') {
    const start = Number(node.attrs?.['start'] ?? 1);
    return { type: 'orderedList', ...(Number.isInteger(start) && start !== 1 && start >= 0 ? { attrs: { start } } : {}), content: items };
  }
  return { type: 'bulletList', content: items };
}

/** TipTap's document as our rich text document, keeping only what the contract allows (decision 0093). */
export function tiptapToRichText(json: JSONContent): RichTextDocument {
  const content: RichTextNode[] = [];
  for (const node of json.content ?? []) {
    if (node.type === 'heading') {
      const level = Number(node.attrs?.['level']);
      const inline = inlineFrom(node);
      content.push({ type: 'heading', attrs: { level: level === 1 || level === 3 || level === 4 ? level : 2 }, ...(inline ? { content: inline } : {}) });
    } else if (node.type === 'blockquote') {
      const paragraphs = (node.content ?? []).map(paragraphFrom);
      content.push({ type: 'blockquote', content: paragraphs.length ? paragraphs : [{ type: 'paragraph' }] });
    } else if (node.type === 'bulletList' || node.type === 'orderedList') {
      const list = listFrom(node);
      if (list) content.push(list);
    } else {
      content.push(paragraphFrom(node));
    }
  }
  const doc: RichTextDocument = { type: 'doc', content };
  // A last guard: whatever comes out must pass the contract.
  return richTextDocumentSchema.safeParse(doc).success ? doc : { type: 'doc', content: content.filter((node) => node.type === 'paragraph') };
}
