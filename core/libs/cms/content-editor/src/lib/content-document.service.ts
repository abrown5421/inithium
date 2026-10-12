import {
  createContentId,
  richTextFromPlainText,
  sectionLayouts,
  type ContentBlock,
  type ContentBlockType,
  type ContentColumn,
  type ContentDocument,
  type ContentSection,
  type SectionLayout,
} from '@inithium/shared-contracts';

/** What the editor has selected: a section, one of its columns, or a block in a column. */
export type EditorSelection =
  | { kind: 'section'; sectionId: string }
  | { kind: 'column'; sectionId: string; columnId: string }
  | { kind: 'block'; sectionId: string; columnId: string; blockId: string }
  | null;

/** Where a block sits. */
export type BlockLocation = { section: ContentSection; column: ContentColumn; block: ContentBlock; index: number };

export function findSection(doc: ContentDocument, sectionId: string): ContentSection | undefined {
  return doc.sections.find((section) => section.id === sectionId);
}

export function findBlock(doc: ContentDocument, blockId: string): BlockLocation | undefined {
  for (const section of doc.sections) {
    for (const column of section.columns) {
      const index = column.blocks.findIndex((block) => block.id === blockId);
      if (index >= 0) return { section, column, block: column.blocks[index] as ContentBlock, index };
    }
  }
  return undefined;
}

const mapSections = (doc: ContentDocument, map: (section: ContentSection) => ContentSection): ContentDocument => ({
  ...doc,
  sections: doc.sections.map(map),
});

const mapColumns = (doc: ContentDocument, map: (column: ContentColumn, section: ContentSection) => ContentColumn) =>
  mapSections(doc, (section) => ({ ...section, columns: section.columns.map((column) => map(column, section)) }));

/** Replaces a section's settings (not its columns). */
export function updateSection(doc: ContentDocument, sectionId: string, changes: Partial<Omit<ContentSection, 'id' | 'columns' | 'layout'>>) {
  return mapSections(doc, (section) => {
    if (section.id !== sectionId) return section;
    const next = { ...section, ...changes } as ContentSection & Record<string, unknown>;
    // undefined clears an optional setting.
    for (const key of Object.keys(changes)) if (next[key] === undefined) delete next[key];
    return next;
  });
}

/** Replaces a block with an edited copy of itself. */
export function updateBlock(doc: ContentDocument, block: ContentBlock): ContentDocument {
  return mapColumns(doc, (column) => ({
    ...column,
    blocks: column.blocks.map((candidate) => (candidate.id === block.id ? block : candidate)),
  }));
}

/**
 * Changes a section's layout. New columns start empty; when there are fewer columns, the blocks of the dropped ones
 * move to the end of the last one kept, so nothing is lost.
 */
export function setSectionLayout(doc: ContentDocument, sectionId: string, layout: SectionLayout): ContentDocument {
  return mapSections(doc, (section) => {
    if (section.id !== sectionId) return section;
    const count = sectionLayouts[layout].length;
    const kept = section.columns.slice(0, count);
    const dropped = section.columns.slice(count).flatMap((column) => column.blocks);
    const columns = [...kept];
    while (columns.length < count) columns.push({ id: createContentId(), blocks: [] });
    const last = columns[count - 1] as ContentColumn;
    columns[count - 1] = { ...last, blocks: [...last.blocks, ...dropped] };
    return { ...section, layout, columns };
  });
}

/** A new section with empty columns for its layout. */
export function createSection(layout: SectionLayout): ContentSection {
  return { id: createContentId(), layout, columns: sectionLayouts[layout].map(() => ({ id: createContentId(), blocks: [] })) };
}

/** Inserts a section after another, or at the end. */
export function insertSection(doc: ContentDocument, section: ContentSection, afterId?: string): ContentDocument {
  const index = afterId ? doc.sections.findIndex((candidate) => candidate.id === afterId) : -1;
  const sections = [...doc.sections];
  sections.splice(index >= 0 ? index + 1 : sections.length, 0, section);
  return { ...doc, sections };
}

export function removeSection(doc: ContentDocument, sectionId: string): ContentDocument {
  return { ...doc, sections: doc.sections.filter((section) => section.id !== sectionId) };
}

/** Moves a section one place up (-1) or down (1). */
export function moveSection(doc: ContentDocument, sectionId: string, by: -1 | 1): ContentDocument {
  return { ...doc, sections: move(doc.sections, doc.sections.findIndex((section) => section.id === sectionId), by) };
}

/** A copy of a section with fresh ids throughout. */
export function copySection(section: ContentSection): ContentSection {
  return {
    ...structuredClone(section),
    id: createContentId(),
    anchor: undefined,
    columns: section.columns.map((column) => ({ id: createContentId(), blocks: column.blocks.map(copyBlock) })),
  };
}

/** A copy of a block with fresh ids. */
export function copyBlock(block: ContentBlock): ContentBlock {
  const copy = { ...structuredClone(block), id: createContentId() };
  if (copy.type === 'buttons') copy.buttons = copy.buttons.map((button) => ({ ...button, id: createContentId() }));
  return copy;
}

/** Inserts a block into a column, after another block or at the end. */
export function insertBlock(doc: ContentDocument, columnId: string, block: ContentBlock, afterId?: string): ContentDocument {
  return mapColumns(doc, (column) => {
    if (column.id !== columnId) return column;
    const index = afterId ? column.blocks.findIndex((candidate) => candidate.id === afterId) : -1;
    const blocks = [...column.blocks];
    blocks.splice(index >= 0 ? index + 1 : blocks.length, 0, block);
    return { ...column, blocks };
  });
}

export function removeBlock(doc: ContentDocument, blockId: string): ContentDocument {
  return mapColumns(doc, (column) => ({ ...column, blocks: column.blocks.filter((block) => block.id !== blockId) }));
}

/** Moves a block one place up (-1) or down (1) within its column. */
export function moveBlock(doc: ContentDocument, blockId: string, by: -1 | 1): ContentDocument {
  return mapColumns(doc, (column) => ({ ...column, blocks: move(column.blocks, column.blocks.findIndex((block) => block.id === blockId), by) }));
}

/** Moves a block to the end of another column (in any section). */
export function moveBlockToColumn(doc: ContentDocument, blockId: string, columnId: string): ContentDocument {
  const found = findBlock(doc, blockId);
  if (!found || found.column.id === columnId) return doc;
  return insertBlock(removeBlock(doc, blockId), columnId, found.block);
}

function move<T>(items: T[], index: number, by: -1 | 1): T[] {
  const target = index + by;
  if (index < 0 || target < 0 || target >= items.length) return items;
  const next = [...items];
  [next[index], next[target]] = [next[target] as T, next[index] as T];
  return next;
}

/** A new block of a type, with starting content that's valid as it is. */
export function createBlock(type: ContentBlockType): ContentBlock {
  const id = createContentId();
  switch (type) {
    case 'heading':
      return { id, type, level: 2, text: 'A heading' };
    case 'rich-text':
      return { id, type, doc: richTextFromPlainText('Write something here.') };
    case 'buttons':
      return { id, type, buttons: [{ id: createContentId(), label: 'Find out more', link: { type: 'url', href: 'https://example.com' } }] };
    case 'feature':
      return { id, type, icon: 'star', title: 'A feature', text: 'A sentence or two about it.' };
    case 'banner':
      return {
        id,
        type,
        height: 240,
        heading: 'A banner heading',
        pattern: {
          cellSize: 90,
          variance: 0.7,
          xColors: [
            { color: 'primary', intensity: 700 },
            { color: 'secondary', intensity: 500 },
          ],
          yColors: [
            { color: 'tertiary', intensity: 600 },
            { color: 'primary', intensity: 800 },
          ],
          seed: createContentId(),
        },
      };
    case 'divider':
      return { id, type };
    case 'spacer':
      return { id, type, height: 32 };
  }
}

/** How the editor names each block type, with its icon. */
export const BLOCK_TYPES: Record<ContentBlockType, { label: string; icon: string; description: string }> = {
  heading: { label: 'Heading', icon: 'heading', description: 'A title for a part of the page' },
  'rich-text': { label: 'Text', icon: 'text', description: 'Paragraphs, lists, quotes and links' },
  buttons: { label: 'Buttons', icon: 'mouse-pointer-click', description: 'One to four links as buttons' },
  feature: { label: 'Feature', icon: 'sparkles', description: 'An icon with a title and a line of text' },
  banner: { label: 'Banner', icon: 'image', description: 'A patterned banner with a heading' },
  divider: { label: 'Divider', icon: 'minus', description: 'A line between things' },
  spacer: { label: 'Spacer', icon: 'move-vertical', description: 'Empty space' },
};

/** How the editor names each section layout. */
export const LAYOUT_LABELS: Record<SectionLayout, string> = {
  one: 'One column',
  halves: 'Two halves',
  'one-third-two-thirds': 'A third, then two thirds',
  'two-thirds-one-third': 'Two thirds, then a third',
  thirds: 'Three thirds',
  quarters: 'Four quarters',
};

/** A short description of a block for the structure tree, e.g. a heading's text. */
export function blockSummary(block: ContentBlock): string {
  switch (block.type) {
    case 'heading':
      return block.text;
    case 'rich-text': {
      const first = block.doc.content.find((node) => node.type === 'paragraph' || node.type === 'heading');
      const text = first && 'content' in first ? (first.content ?? []).map((part) => (part.type === 'text' ? part.text : ' ')).join('') : '';
      return text || 'Empty text';
    }
    case 'buttons':
      return block.buttons.map((button) => button.label).join(', ');
    case 'feature':
      return block.title;
    case 'banner':
      return block.heading || 'Banner';
    case 'divider':
      return 'Divider';
    case 'spacer':
      return `${block.height}px of space`;
  }
}

/** JSON with every object's keys sorted, so the same content always gives the same text whatever its key order. */
function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, entry]) => entry !== undefined)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, entry]) => [key, canonical(entry)]),
    );
  }
  return value;
}

/** Whether two content documents say the same thing (e.g. the draft and what's published). */
export const sameContent = (a: ContentDocument | null | undefined, b: ContentDocument | null | undefined) =>
  JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));
