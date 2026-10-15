import { describe, expect, it } from 'vitest';
import { createContentId } from './content-common.schema';
import { emptyContentDocument, readContentDocument } from './content.schema';
import { contentDocumentV1Schema, emptyContentDocumentV1, readContentDocumentV1 } from './v1/content-v1.schema';
import {
  richTextDocumentSchema,
  richTextFeaturesUsed,
  richTextFromPlainText,
  richTextIsEmpty,
  richTextLength,
  restrictedRichTextSchema,
  type RichTextDocument,
} from './rich-text.schema';

describe('version 1 content documents (decision 0093)', () => {
  it('starts empty pages with one single-column section', () => {
    let next = 0;
    const doc = emptyContentDocumentV1(() => `id-${++next}`);
    expect(doc).toEqual({ schemaVersion: 1, sections: [{ id: 'id-1', layout: 'one', columns: [{ id: 'id-2', blocks: [] }] }] });
    expect(contentDocumentV1Schema.safeParse(doc).success).toBe(true);
  });

  it('makes ids the contract accepts', () => {
    for (let i = 0; i < 50; i++) expect(createContentId()).toMatch(/^[a-zA-Z0-9_-]{1,40}$/);
  });

  it('requires a section’s columns to match its layout', () => {
    const doc = emptyContentDocumentV1(createContentId);
    const section = doc.sections[0];
    if (!section) throw new Error('expected a section');
    expect(contentDocumentV1Schema.safeParse({ ...doc, sections: [{ ...section, layout: 'halves' }] }).success).toBe(false);
    const halves = { ...section, layout: 'halves', columns: [...section.columns, { id: 'second', blocks: [] }] };
    expect(contentDocumentV1Schema.safeParse({ ...doc, sections: [halves] }).success).toBe(true);
  });

  it('reads valid stored version 1 content and refuses anything else', () => {
    const doc = emptyContentDocumentV1(createContentId);
    expect(readContentDocumentV1(doc)).toEqual(doc);
    expect(readContentDocumentV1(emptyContentDocument())).toBeUndefined();
    expect(readContentDocumentV1('<p>html</p>')).toBeUndefined();
  });
});

describe('readContentDocument (decision 0116)', () => {
  it('reads the current version as it is', () => {
    expect(readContentDocument(emptyContentDocument())).toEqual({ schemaVersion: 2, elements: [] });
  });

  it('upgrades version 1', () => {
    const upgraded = readContentDocument(emptyContentDocumentV1(() => 'only'));
    expect(upgraded?.schemaVersion).toBe(2);
    expect(upgraded?.elements).toHaveLength(1);
  });

  it('refuses anything else', () => {
    expect(readContentDocument(undefined)).toBeUndefined();
    expect(readContentDocument({ schemaVersion: 99, elements: [] })).toBeUndefined();
    expect(readContentDocument({ schemaVersion: 1, elements: [] })).toBeUndefined();
    expect(readContentDocument('<p>html</p>')).toBeUndefined();
  });
});

const link = (href: string) => ({ type: 'link' as const, attrs: { link: { type: 'url' as const, href } } });
const pageLink = { type: 'link' as const, attrs: { link: { type: 'page' as const, pageId: 'abc' } } };

const sample: RichTextDocument = {
  type: 'doc',
  content: [
    { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Title' }] },
    { type: 'paragraph', content: [{ type: 'text', text: 'Bold', marks: [{ type: 'bold' }] }, { type: 'hardBreak' }, { type: 'text', text: 'ok', marks: [link('https://example.com')] }] },
    { type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'item' }] }] }] },
  ],
};

describe('rich text (decision 0102)', () => {
  it('turns plain text into one paragraph per line', () => {
    const doc = richTextFromPlainText('one\n\ntwo');
    expect(doc.content).toHaveLength(3);
    expect(richTextDocumentSchema.safeParse(doc).success).toBe(true);
  });

  it('counts visible characters, a line break as one', () => {
    // 'Title' 5 + 'Bold' 4 + break 1 + 'ok' 2 + 'item' 4
    expect(richTextLength(sample)).toBe(16);
    expect(richTextLength(richTextFromPlainText('👍🏽'))).toBe(2);
  });

  it('knows when a document has no visible text', () => {
    expect(richTextIsEmpty(richTextFromPlainText('   \n '))).toBe(true);
    expect(richTextIsEmpty(sample)).toBe(false);
  });

  it('lists the features a document uses', () => {
    expect([...richTextFeaturesUsed(sample)].sort()).toEqual(['bold', 'bulletList', 'heading', 'link']);
  });

  describe('restrictedRichTextSchema', () => {
    it('refuses features the field doesn’t allow', () => {
      const schema = restrictedRichTextSchema({ features: ['bold', 'link'] });
      const result = schema.safeParse(sample);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toContain('heading');
    });

    it('enforces the length limit', () => {
      const schema = restrictedRichTextSchema({ features: [], maxLength: 5 });
      expect(schema.safeParse(richTextFromPlainText('12345')).success).toBe(true);
      expect(schema.safeParse(richTextFromPlainText('123456')).success).toBe(false);
    });

    it('can refuse links to the site’s pages', () => {
      const schema = restrictedRichTextSchema({ features: ['link'], urlLinksOnly: true });
      const withPageLink: RichTextDocument = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'x', marks: [pageLink] }] }] };
      expect(schema.safeParse(withPageLink).success).toBe(false);
    });

    it('refuses links to unsafe addresses whatever the field allows', () => {
      const schema = restrictedRichTextSchema({ features: ['link'] });
      const unsafe = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'x', marks: [link('javascript:alert(1)')] }] }] };
      expect(schema.safeParse(unsafe).success).toBe(false);
    });
  });
});
