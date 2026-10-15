import { describe, expect, it } from 'vitest';
import { contentDocumentSchema } from './content.schema';
import { contentElementSchema, MAX_CONTENT_DEPTH, MAX_CONTENT_ELEMENTS } from './content-elements.schema';
import type { ContentElement } from './content.types';
import { richTextFromPlainText } from './rich-text.schema';

const text = (id: string, value = 'Hello'): ContentElement => ({ id, type: 'text', props: { doc: richTextFromPlainText(value) } });
const box = (id: string, children: ContentElement[] = [], props = {}): ContentElement => ({ id, type: 'container', props, children });
const doc = (elements: unknown[]) => ({ schemaVersion: 2, elements });

/** A chain of Containers `depth` deep. */
function nested(depth: number): ContentElement {
  let element = box(`c${depth}`);
  for (let level = depth - 1; level >= 1; level--) element = box(`c${level}`, [element]);
  return element;
}

describe('content elements (decision 0116)', () => {
  it('takes every core element, with its component’s stored props', () => {
    const card = box(
      'card',
      [
        text('title'),
        { id: 'pic', type: 'image', props: { assetId: 'a1', alt: 'A view', radius: { all: 8 }, width: { base: 'full', md: 320 } } },
        { id: 'star', type: 'icon', props: { name: 'star', size: 32, textColor: 'accent' } },
        { id: 'rule', type: 'divider', props: { thickness: 2, label: 'or' } },
        { id: 'go', type: 'button', props: { label: 'Go', link: { type: 'url', href: 'https://example.com' }, variant: 'outlined', hidden: { base: true, md: false } } },
      ],
      { flex: { direction: { base: 'column', md: 'row' }, gap: 16 }, padding: { all: 24 }, radius: { all: 12 }, shadow: 'md', anchor: 'cards' },
    );
    const result = contentDocumentSchema.safeParse(doc([card]));
    expect(result.error?.issues).toBeUndefined();
    expect(result.data?.elements[0]).toEqual(card);
  });

  it('points a problem at the field, not at every element type', () => {
    const result = contentDocumentSchema.safeParse(doc([box('row', [{ id: 'go', type: 'button', props: { label: '', link: { type: 'url', href: 'https://a.b' } } }])]));
    expect(result.error?.issues).toEqual([expect.objectContaining({ path: ['elements', 0, 'children', 0, 'props', 'label'], message: 'Enter the button’s text' })]);
  });

  it('refuses unknown types, stray props and children on elements that hold none', () => {
    expect(contentElementSchema.safeParse({ id: 'x', type: 'video', props: {} }).error?.issues[0]?.path).toEqual(['type']);
    expect(contentElementSchema.safeParse({ id: 'x', type: 'constructor', props: {} }).success).toBe(false);
    expect(contentElementSchema.safeParse({ ...text('x'), props: { doc: richTextFromPlainText('a'), onClick: 'x' } }).success).toBe(false);
    expect(contentElementSchema.safeParse({ ...text('x'), children: [] }).success).toBe(false);
  });

  it('leaves out Container props that break layouts', () => {
    expect(contentElementSchema.safeParse(box('x', [], { position: { type: 'absolute' } })).success).toBe(false);
    expect(contentElementSchema.safeParse(box('x', [], { overflow: { all: 'hidden' } })).success).toBe(false);
  });

  it('requires an image’s alt text unless it’s decorative', () => {
    expect(contentElementSchema.safeParse({ id: 'i', type: 'image', props: { assetId: 'a' } }).error?.issues[0]?.path).toEqual(['props', 'alt']);
    expect(contentElementSchema.safeParse({ id: 'i', type: 'image', props: { assetId: 'a', decorative: true } }).success).toBe(true);
  });

  it('keeps plugin elements whatever their props, so content still saves while the plugin is off or gone', () => {
    const product = { id: 'p', type: 'plugin-ecom:product-grid', props: { columns: 3, anything: { at: 'all' } }, children: [text('t')] };
    expect(contentElementSchema.safeParse(product).data).toEqual(product);
    expect(contentElementSchema.safeParse({ ...product, type: 'plugin-ecom' }).success).toBe(false);
    expect(contentElementSchema.safeParse({ ...product, type: 'plugin-Ecom:grid' }).success).toBe(false);
  });

  it('checks plugin elements’ children like any others', () => {
    const product = { id: 'p', type: 'plugin-ecom:product-grid', props: {}, children: [{ id: 't', type: 'text', props: {} }] };
    expect(contentElementSchema.safeParse(product).error?.issues[0]?.path).toEqual(['children', 0, 'props', 'doc']);
  });
});

describe('content limits (decision 0116)', () => {
  it(`allows ${MAX_CONTENT_ELEMENTS} elements on a page and no more, nested ones included`, () => {
    const many = (count: number) => [box('row', Array.from({ length: count - 1 }, (_, index) => text(`t${index}`)))];
    expect(contentDocumentSchema.safeParse(doc(many(MAX_CONTENT_ELEMENTS))).success).toBe(true);
    const result = contentDocumentSchema.safeParse(doc(many(MAX_CONTENT_ELEMENTS + 1)));
    expect(result.error?.issues[0]?.message).toBe('Use 250 elements or fewer on a page');
  });

  it(`nests ${MAX_CONTENT_DEPTH} deep and no deeper`, () => {
    expect(contentDocumentSchema.safeParse(doc([nested(MAX_CONTENT_DEPTH)])).success).toBe(true);
    const result = contentDocumentSchema.safeParse(doc([nested(MAX_CONTENT_DEPTH + 1)]));
    expect(result.error?.issues[0]?.message).toBe('Nest elements 10 deep or fewer');
  });

  it('stops at the limits without parsing what lies beyond them', () => {
    // Deep enough to overflow the stack if it were parsed recursively.
    let element: unknown = { id: 'leaf', type: 'container', props: {}, children: [] };
    for (let level = 0; level < 20000; level++) element = { id: `c${level}`, type: 'container', props: {}, children: [element] };
    expect(contentDocumentSchema.safeParse(doc([element])).success).toBe(false);
  });

  it('needs every element to have its own id', () => {
    const result = contentDocumentSchema.safeParse(doc([box('same', [text('same')])]));
    expect(result.error?.issues[0]).toEqual(expect.objectContaining({ message: 'Each element needs its own id', path: ['elements', 0, 'children', 0, 'id'] }));
  });
});
