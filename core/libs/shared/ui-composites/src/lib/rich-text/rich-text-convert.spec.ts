import type { JSONContent } from '@tiptap/react';
import { describe, expect, it } from 'vitest';
import { richTextDocumentSchema, type RichTextDocument } from '@inithium/shared-contracts';
import { attrsToLink, linkToAttrs, PAGE_LINK_SCHEME, richTextToTiptap, tiptapToRichText } from './rich-text-convert.service';
import { RICH_TEXT_STYLE_MARK, richTextStyleCss } from './rich-text-style.extension';

const everything: RichTextDocument = {
  type: 'doc',
  content: [
    { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Heading' }] },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'bold', marks: [{ type: 'bold' }, { type: 'italic' }, { type: 'underline' }] },
        { type: 'hardBreak' },
        { type: 'text', text: 'site', marks: [{ type: 'link', attrs: { link: { type: 'url', href: 'https://example.com', newTab: true } } }] },
        { type: 'text', text: 'page', marks: [{ type: 'link', attrs: { link: { type: 'page', pageId: '64b0c0ffee' } } }] },
      ],
    },
    { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'quote' }] }] },
    {
      type: 'orderedList',
      attrs: { start: 3 },
      content: [
        {
          type: 'listItem',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'one' }] },
            { type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'nested' }] }] }] },
          ],
        },
      ],
    },
    { type: 'paragraph' },
  ],
};

describe('rich text ⇄ TipTap (decision 0102)', () => {
  it('round-trips every feature unchanged', () => {
    expect(richTextDocumentSchema.safeParse(everything).success).toBe(true);
    expect(tiptapToRichText(richTextToTiptap(everything))).toEqual(everything);
  });

  it('gives TipTap an empty paragraph for an empty document', () => {
    expect(richTextToTiptap({ type: 'doc', content: [] })).toEqual({ type: 'doc', content: [{ type: 'paragraph' }] });
  });

  it('drops what the contract doesn’t allow, keeping the text', () => {
    const pasted = {
      type: 'doc',
      content: [
        { type: 'codeBlock', content: [{ type: 'text', text: 'code', marks: [{ type: 'code' }, { type: 'strike' }] }] },
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Big' }] },
        // eslint-disable-next-line no-script-url -- checking that script addresses are dropped
        { type: 'paragraph', content: [{ type: 'text', text: 'bad', marks: [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }] }] },
      ],
    };
    expect(tiptapToRichText(pasted)).toEqual({
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'code' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Big' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'bad' }] },
      ],
    });
  });
});

describe('links', () => {
  it('writes page links with the inithium-page scheme and reads them back', () => {
    const attrs = linkToAttrs({ type: 'page', pageId: 'abc' });
    expect(attrs.href).toBe(`${PAGE_LINK_SCHEME}:abc`);
    expect(attrsToLink(attrs)).toEqual({ type: 'page', pageId: 'abc' });
  });

  it.each(['https://example.com', 'http://example.com', 'mailto:a@b.co', 'tel:+441234567890'])('allows %s', (href) => {
    expect(attrsToLink({ href })).toEqual({ type: 'url', href });
  });

  // eslint-disable-next-line no-script-url -- checking that script addresses are refused
  it.each(['javascript:alert(1)', 'data:text/html,hi', '/relative', '', `${PAGE_LINK_SCHEME}:`])('refuses %j', (href) => {
    expect(attrsToLink({ href })).toBeUndefined();
  });
});

describe('restyled words (decision 0115)', () => {
  const FAMILY = '0123456789abcdef01234567';
  const doc: RichTextDocument = {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'big', marks: [{ type: 'bold' }, { type: 'textStyle', attrs: { family: { familyId: FAMILY }, weight: 800, size: 1.5, color: 'accent' } }] },
        ],
      },
    ],
  };

  it('travel through TipTap as our own mark and come back unchanged', () => {
    const tiptap = richTextToTiptap(doc);
    expect(tiptap.content?.[0]?.content?.[0]?.marks).toContainEqual({ type: RICH_TEXT_STYLE_MARK, attrs: { family: { familyId: FAMILY }, weight: 800, size: 1.5, color: 'accent' } });
    expect(tiptapToRichText(tiptap)).toEqual(doc);
  });

  it('drop attributes left empty by the editor, and styles that fail the contract', () => {
    const run = (marks: NonNullable<JSONContent['marks']>): JSONContent => ({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'x', marks }] }] });
    expect(tiptapToRichText(run([{ type: RICH_TEXT_STYLE_MARK, attrs: { family: 'display', weight: null, size: null, color: null } }]))).toEqual({
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'x', marks: [{ type: 'textStyle', attrs: { family: 'display' } }] }] }],
    });
    const plain = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'x' }] }] };
    expect(tiptapToRichText(run([{ type: RICH_TEXT_STYLE_MARK, attrs: { family: { familyId: 'url(evil)' } } }]))).toEqual(plain);
    // TipTap's own text style (raw CSS) isn't ours, so pasted fonts and colours are dropped.
    expect(tiptapToRichText(run([{ type: 'textStyle', attrs: { fontFamily: 'Comic Sans MS', color: '#f00' } }]))).toEqual(plain);
  });

  it('draw through the theme’s variables in the editor', () => {
    expect(richTextStyleCss({ family: { familyId: FAMILY }, weight: 800, size: 1.5, color: 'accent' })).toBe(
      `font-family: var(--font-family-${FAMILY}, var(--font-body)); font-weight: 800; font-size: 1.5em; color: var(--color-accent-500)`,
    );
  });
});
