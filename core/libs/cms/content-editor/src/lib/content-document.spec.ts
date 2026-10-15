import { describe, expect, it } from 'vitest';
import { contentBlockSchema, contentBlockTypes, contentDocumentV1Schema, emptyContentDocumentV1, createContentId, type ContentDocumentV1 } from '@inithium/shared-contracts';
import {
  copySection,
  createBlock,
  createSection,
  findBlock,
  insertBlock,
  insertSection,
  moveBlockToColumn,
  moveSection,
  sameContent,
  setSectionLayout,
} from './content-document.service';

const columnIds = (doc: ContentDocumentV1) => doc.sections.flatMap((section) => section.columns.map((column) => column.id));

describe('content editing (decision 0094)', () => {
  it('starts every block type valid, except an image waiting for its picture', () => {
    for (const type of contentBlockTypes) {
      expect(contentBlockSchema.safeParse(createBlock(type)).success, type).toBe(type !== 'image');
    }
  });

  it('never loses blocks when a section gets fewer columns', () => {
    let doc = insertSection(emptyContentDocumentV1(createContentId), createSection('thirds'));
    const section = doc.sections[1];
    if (!section) throw new Error('expected a second section');
    const [first, second, third] = section.columns.map((column) => column.id) as [string, string, string];
    doc = insertBlock(doc, first, createBlock('heading'));
    doc = insertBlock(doc, second, createBlock('divider'));
    doc = insertBlock(doc, third, createBlock('spacer'));

    const narrowed = setSectionLayout(doc, section.id, 'one');
    const kept = narrowed.sections[1];
    expect(kept?.columns).toHaveLength(1);
    expect(kept?.columns[0]?.blocks.map((block) => block.type)).toEqual(['heading', 'divider', 'spacer']);
    expect(contentDocumentV1Schema.safeParse(narrowed).success).toBe(true);
  });

  it('copies sections with fresh ids everywhere and no anchor', () => {
    const section = { ...createSection('halves'), anchor: 'pricing' };
    section.columns[0]?.blocks.push(createBlock('buttons'));
    const copy = copySection(section);
    expect(copy.id).not.toBe(section.id);
    expect(copy.anchor).toBeUndefined();
    expect(copy.columns.map((c) => c.id)).not.toEqual(section.columns.map((c) => c.id));
    const [original, copied] = [section.columns[0]?.blocks[0], copy.columns[0]?.blocks[0]];
    expect(copied?.id).not.toBe(original?.id);
    if (original?.type === 'buttons' && copied?.type === 'buttons') expect(copied.buttons[0]?.id).not.toBe(original.buttons[0]?.id);
  });

  it('moves blocks between columns and sections, and leaves the document alone for unknown ids', () => {
    let doc = insertSection(emptyContentDocumentV1(createContentId), createSection('halves'));
    const [from, , to] = columnIds(doc) as [string, string, string];
    const block = createBlock('heading');
    doc = insertBlock(doc, from, block);
    const moved = moveBlockToColumn(doc, block.id, to);
    expect(findBlock(moved, block.id)?.column.id).toBe(to);
    expect(moveBlockToColumn(doc, 'missing', to)).toBe(doc);
    expect(moveSection(doc, doc.sections[0]?.id ?? '', -1)).toEqual(doc);
  });
});

describe('sameContent', () => {
  it('ignores key order and undefined fields, as after a round trip through the api', () => {
    const doc = emptyContentDocumentV1(createContentId);
    const reordered = JSON.parse(JSON.stringify({ sections: doc.sections, schemaVersion: doc.schemaVersion }));
    expect(sameContent(doc, reordered)).toBe(true);
    expect(sameContent(doc, { ...doc, sections: [{ ...doc.sections[0], bgColor: undefined } as never] })).toBe(true);
  });

  it('spots real changes, including content against nothing published', () => {
    const doc = emptyContentDocumentV1(createContentId);
    expect(sameContent(doc, insertSection(doc, createSection('one')))).toBe(false);
    expect(sameContent(doc, null)).toBe(false);
  });
});
