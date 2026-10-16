import { afterEach, describe, expect, it } from 'vitest';
import { z } from 'zod';
import { contentDocumentSchema } from './content.schema';
import { contentElementContract, registerContentElementContracts, type ContentElementContract } from './content-elements.schema';
import { contentReferences } from './content-references.service';

const productGrid: ContentElementContract = {
  type: 'plugin-shop:product-grid',
  props: z.object({ columns: z.number().int().min(1).max(6), featuredPageId: z.string().optional() }).strict(),
  references: (props) => ({ pageIds: typeof props['featuredPageId'] === 'string' ? [props['featuredPageId']] : [] }),
};
const tabs: ContentElementContract = { type: 'plugin-extras:tabs', props: z.object({}).strict(), children: true };

const doc = (...elements: unknown[]) => ({ schemaVersion: 2, elements });

afterEach(() => registerContentElementContracts([]));

describe('the content elements slot (decisions 0015, 0116)', () => {
  it('checks a registered element against its contract, pointing at the field', () => {
    registerContentElementContracts([productGrid]);
    expect(contentDocumentSchema.safeParse(doc({ id: 'g', type: 'plugin-shop:product-grid', props: { columns: 3 } })).success).toBe(true);
    const bad = contentDocumentSchema.safeParse(doc({ id: 'g', type: 'plugin-shop:product-grid', props: { columns: 9 } }));
    expect(bad.error?.issues[0]?.path).toEqual(['elements', 0, 'props', 'columns']);
    expect(contentDocumentSchema.safeParse(doc({ id: 'g', type: 'plugin-shop:product-grid', props: { columns: 3, stray: 1 } })).success).toBe(false);
  });

  it('lets only elements whose contract says so hold others', () => {
    registerContentElementContracts([productGrid, tabs]);
    const child = { id: 't', type: 'divider', props: {} };
    expect(contentDocumentSchema.safeParse(doc({ id: 'x', type: 'plugin-extras:tabs', props: {}, children: [child] })).success).toBe(true);
    expect(contentDocumentSchema.safeParse(doc({ id: 'g', type: 'plugin-shop:product-grid', props: { columns: 3 }, children: [child] })).success).toBe(false);
  });

  it('keeps an element whose plugin isn’t registered, whatever its props, so content still saves', () => {
    expect(contentDocumentSchema.safeParse(doc({ id: 'g', type: 'plugin-shop:product-grid', props: { columns: 'lots' } })).success).toBe(true);
  });

  it('reads a registered element’s references from its contract', () => {
    registerContentElementContracts([productGrid]);
    const found = contentReferences(
      contentDocumentSchema.parse(doc({ id: 'g', type: 'plugin-shop:product-grid', props: { columns: 2, featuredPageId: 'page-1' } })),
    );
    expect([...found.pageIds]).toEqual(['page-1']);
  });

  it('refuses badly named or repeated types, and replaces what was registered before', () => {
    expect(() => registerContentElementContracts([{ ...productGrid, type: 'shop:grid' as never }])).toThrow();
    expect(() => registerContentElementContracts([productGrid, productGrid])).toThrow();
    registerContentElementContracts([tabs]);
    expect(contentElementContract('plugin-shop:product-grid')).toBeUndefined();
    expect(contentElementContract('plugin-extras:tabs')).toBe(tabs);
  });
});
