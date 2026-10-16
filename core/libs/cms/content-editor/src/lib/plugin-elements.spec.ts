import { afterEach, describe, expect, it } from 'vitest';
import { z } from 'zod';
import { registerContentElementContracts, type ContentDocument } from '@inithium/shared-contracts';
import { registerContentElementEditors, type ContentElementEditor } from './content-element-editors.service';
import { addPickerGroups, createElement, elementName, elementType, holdsChildren, insertElement, insertionTarget } from './content-tree.service';

const grid: ContentElementEditor = {
  type: 'plugin-shop:product-grid',
  label: 'Product grid',
  icon: 'shopping-bag',
  description: 'Products from the shop',
  group: 'Shop',
  create: () => ({ props: { columns: 3 } }),
};
const tabs: ContentElementEditor = { type: 'plugin-extras:tabs', label: 'Tabs', icon: 'panels-top-left', description: 'Panels behind tabs', group: 'Layout', create: () => ({ props: {} }) };

afterEach(() => {
  registerContentElementEditors([]);
  registerContentElementContracts([]);
});

describe('plugin elements in the page builder (decision 0116)', () => {
  it('adds them to the Add picker: in the group they name, or a new one after core’s', () => {
    registerContentElementEditors([grid, tabs]);
    const groups = addPickerGroups();
    expect(groups.map((group) => group.label)).toEqual(['Layout', 'Text and media', 'Actions', 'Shop']);
    expect(groups[0]?.items.map((item) => item.type)).toEqual(['container', 'divider', 'plugin-extras:tabs']);
    expect(groups[3]?.items).toEqual([{ type: 'plugin-shop:product-grid', label: 'Product grid', icon: 'shopping-bag', description: 'Products from the shop' }]);
  });

  it('creates and names them from their entry, and names an unregistered one from its type', () => {
    registerContentElementEditors([grid]);
    const element = createElement('plugin-shop:product-grid');
    expect(element).toMatchObject({ type: 'plugin-shop:product-grid', props: { columns: 3 } });
    expect(elementType(element)).toEqual({ label: 'Product grid', icon: 'shopping-bag' });
    expect(elementName(element)).toBe('Product grid');
    registerContentElementEditors([]);
    expect(elementName(element)).toBe('product grid (shop)');
  });

  it('puts elements inside one whose contract says it holds others, starting its list', () => {
    registerContentElementContracts([{ type: 'plugin-extras:tabs', props: z.object({}).strict(), children: true }]);
    const doc: ContentDocument = { schemaVersion: 2, elements: [{ id: 'tabs', type: 'plugin-extras:tabs', props: {} }] };
    expect(holdsChildren(doc.elements[0] as ContentDocument['elements'][number])).toBe(true);
    const target = insertionTarget(doc, 'tabs');
    expect(target).toEqual({ parentId: 'tabs', index: 0 });
    const next = insertElement(doc, { id: 'd', type: 'divider', props: {} }, target);
    expect(next.elements[0]).toMatchObject({ id: 'tabs', children: [{ id: 'd' }] });
  });

  it('never puts elements inside one whose contract doesn’t allow it', () => {
    const doc: ContentDocument = { schemaVersion: 2, elements: [{ id: 'g', type: 'plugin-shop:product-grid', props: {} }] };
    expect(insertElement(doc, { id: 'd', type: 'divider', props: {} }, { parentId: 'g', index: 0 })).toBe(doc);
  });
});
