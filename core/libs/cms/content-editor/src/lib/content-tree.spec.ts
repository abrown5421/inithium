import { describe, expect, it } from 'vitest';
import { contentDocumentSchema, MAX_CONTENT_DEPTH, type ContentDocument, type ContentElement } from '@inithium/shared-contracts';
import {
  allElements,
  copyElement,
  createElement,
  elementName,
  findElement,
  insertElement,
  insertionTarget,
  layerRows,
  limitProblem,
  moveDestinations,
  moveElement,
  moveElementBy,
  removeElement,
  sameContent,
  updateElement,
} from './content-tree.service';

const text = (id: string, words = id): ContentElement => ({ id, type: 'text', props: { doc: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: words }] }] } } });
const box = (id: string, children: ContentElement[] = []): ContentElement => ({ id, type: 'container', props: {}, children });

/** The page from the brief: a row holding a card of a heading and a button, then a closing line. */
const page = (): ContentDocument => ({
  schemaVersion: 2,
  elements: [box('row', [box('card', [text('title'), { id: 'go', type: 'button', props: { label: 'Go', link: { type: 'url', href: 'https://a.b' } } }])]), text('end')],
});

/** The ids in page order, with their nesting, e.g. 'row(card(title,go)),end'. */
function shape(elements: ContentElement[]): string {
  return elements.map((element) => (element.type === 'container' ? `${element.id}(${shape(element.children)})` : element.id)).join(',');
}

describe('the page builder’s tree (decision 0116)', () => {
  it('finds an element with its parent, place and Containers', () => {
    const found = findElement(page(), 'go');
    expect(found?.parent?.id).toBe('card');
    expect(found?.index).toBe(1);
    expect(found?.ancestors.map((ancestor) => ancestor.id)).toEqual(['row', 'card']);
    expect(findElement(page(), 'end')?.parent).toBeNull();
    expect(findElement(page(), 'nope')).toBeUndefined();
  });

  it('updates and removes elements anywhere, leaving untouched branches as they were', () => {
    const doc = page();
    const renamed = updateElement(doc, { ...text('title'), label: 'Heading' });
    expect(findElement(renamed, 'title')?.element.label).toBe('Heading');
    expect(renamed.elements[1]).toBe(doc.elements[1]);
    expect(shape(removeElement(doc, 'card').elements)).toBe('row(),end');
    expect(removeElement(doc, 'nope')).toBe(doc);
  });

  it('inserts into a Container or the page, and nowhere else', () => {
    const doc = page();
    expect(shape(insertElement(doc, text('new'), { parentId: 'card', index: 1 }).elements)).toBe('row(card(title,new,go)),end');
    expect(shape(insertElement(doc, text('new'), { parentId: null, index: 0 }).elements)).toBe('new,row(card(title,go)),end');
    expect(insertElement(doc, text('new'), { parentId: 'title', index: 0 })).toBe(doc);
  });

  it('puts new elements inside the selected Container, else after the selection, else at the end', () => {
    const doc = page();
    expect(insertionTarget(doc, 'card')).toEqual({ parentId: 'card', index: 2 });
    expect(insertionTarget(doc, 'title')).toEqual({ parentId: 'card', index: 1 });
    expect(insertionTarget(doc, null)).toEqual({ parentId: null, index: 2 });
  });

  it('duplicates a card and everything in it with new ids, so a row of cards is one card copied', () => {
    const doc = page();
    const card = findElement(doc, 'card')?.element as ContentElement;
    const copy = copyElement(card);
    const withCopy = insertElement(doc, copy, { parentId: 'row', index: 1 });
    const ids = allElements(withCopy.elements).map((element) => element.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(sameContent({ ...copy, id: card.id, children: card.type === 'container' ? card.children : [] }, card)).toBe(true);
    expect(contentDocumentSchema.safeParse(withCopy).success).toBe(true);
  });

  it('doesn’t copy anchors, which must stay unique', () => {
    const anchored: ContentElement = { id: 'a', type: 'container', props: { anchor: 'pricing', padding: { all: 8 } }, children: [] };
    expect(copyElement(anchored).type === 'container' && copyElement(anchored).props).toEqual({ padding: { all: 8 } });
  });

  it('moves elements, counting the index as the drop indicator shows it', () => {
    const doc = page();
    expect(shape(moveElement(doc, 'title', { parentId: 'card', index: 2 }).elements)).toBe('row(card(go,title)),end');
    expect(shape(moveElement(doc, 'end', { parentId: 'row', index: 0 }).elements)).toBe('row(end,card(title,go))');
    expect(moveElement(doc, 'title', { parentId: 'card', index: 1 })).toBe(doc);
  });

  it('never moves an element into itself or anything inside it', () => {
    const doc = page();
    expect(moveElement(doc, 'row', { parentId: 'card', index: 0 })).toBe(doc);
    expect(moveElement(doc, 'card', { parentId: 'card', index: 0 })).toBe(doc);
  });

  it('moves an element one place up or down among its siblings', () => {
    const doc = page();
    expect(shape(moveElementBy(doc, 'title', 1).elements)).toBe('row(card(go,title)),end');
    expect(shape(moveElementBy(doc, 'go', -1).elements)).toBe('row(card(go,title)),end');
    expect(moveElementBy(doc, 'title', -1)).toBe(doc);
  });

  it('says when an element would break the page’s limits', () => {
    let deep: ContentElement = box(`level-${MAX_CONTENT_DEPTH}`);
    for (let level = MAX_CONTENT_DEPTH - 1; level >= 1; level--) deep = box(`level-${level}`, [deep]);
    const doc: ContentDocument = { schemaVersion: 2, elements: [deep] };
    expect(limitProblem(doc, text('new'), { parentId: `level-${MAX_CONTENT_DEPTH}`, index: 0 })).toBe('Elements nest 10 deep at most.');
    expect(limitProblem(doc, text('new'), { parentId: `level-${MAX_CONTENT_DEPTH - 1}`, index: 0 })).toBeUndefined();
    const full: ContentDocument = { schemaVersion: 2, elements: Array.from({ length: 250 }, (_, index) => text(`t${index}`)) };
    expect(limitProblem(full, text('new'), { parentId: null, index: 0 })).toBe('A page holds 250 elements at most.');
    expect(limitProblem(full, full.elements[0] as ContentElement, { parentId: null, index: 3 }, 't0')).toBeUndefined();
  });

  it('lists the Layers’ rows, leaving out what collapsed Containers hold', () => {
    const rows = (collapsed: string[]) => layerRows(page().elements, new Set(collapsed)).map((row) => `${row.element.id}@${row.depth}`);
    expect(rows([])).toEqual(['row@0', 'card@1', 'title@2', 'go@2', 'end@0']);
    expect(rows(['card'])).toEqual(['row@0', 'card@1', 'end@0']);
  });

  it('offers every Container but the element itself and those inside it as a destination', () => {
    expect(moveDestinations(page(), 'card').map((entry) => entry.parentId)).toEqual([null, 'row']);
    expect(moveDestinations(page(), 'title').map((entry) => entry.parentId)).toEqual([null, 'row', 'card']);
  });

  it('names elements by their label, their content or their type', () => {
    expect(elementName({ ...box('x'), label: 'Pricing card' })).toBe('Pricing card');
    expect(elementName(text('x', 'Our services'))).toBe('Our services');
    expect(elementName(box('x'))).toBe('Container');
    expect(elementName({ id: 'p', type: 'plugin-ecom:product-grid', props: {} })).toBe('product grid (ecom)');
  });

  it('creates every element type valid as it is, except an image waiting to be chosen', () => {
    for (const type of ['container', 'text', 'icon', 'button', 'divider'] as const) {
      expect(contentDocumentSchema.safeParse({ schemaVersion: 2, elements: [createElement(type)] }).success).toBe(true);
    }
    expect(contentDocumentSchema.safeParse({ schemaVersion: 2, elements: [createElement('image')] }).success).toBe(false);
  });
});
