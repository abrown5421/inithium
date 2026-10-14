import { describe, expect, it } from 'vitest';
import { richTextDocumentSchema, type RichTextDocument } from '@inithium/shared-contracts';
import { attrsToLink, linkToAttrs, PAGE_LINK_SCHEME, richTextToTiptap, tiptapToRichText } from './rich-text-convert.service';

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
