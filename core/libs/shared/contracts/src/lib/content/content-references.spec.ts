import { describe, expect, it } from 'vitest';
import type { ContentDocument } from './content.types';
import { contentReferences } from './content-references.service';

const FAMILY = '0123456789abcdef01234567';
const OTHER_FAMILY = 'abcdefabcdefabcdefabcdef';

const doc: ContentDocument = {
  schemaVersion: 2,
  elements: [
    {
      id: 'card',
      type: 'container',
      props: {},
      children: [
        { id: 'pic', type: 'image', props: { assetId: 'asset-1', decorative: true, link: { type: 'page', pageId: 'page-a' }, captionTypography: { fontFamily: { familyId: FAMILY } } } },
        {
          id: 'words',
          type: 'text',
          props: {
            doc: {
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    { type: 'text', text: 'See ', marks: [{ type: 'link', attrs: { link: { type: 'page', pageId: 'page-b' } } }] },
                    { type: 'text', text: 'this', marks: [{ type: 'textStyle', attrs: { family: { familyId: OTHER_FAMILY } } }] },
                    { type: 'text', text: 'there', marks: [{ type: 'link', attrs: { link: { type: 'url', href: 'https://a.b' } } }] },
                  ],
                },
              ],
            },
            headingTypography: { fontFamily: 'display' },
          },
        },
        { id: 'go', type: 'button', props: { label: 'Go', link: { type: 'page', pageId: 'page-c' } } },
      ],
    },
    { id: 'plugin', type: 'plugin-shop:product', props: { assetId: 'asset-2', more: { link: { type: 'page', pageId: 'page-d' } } } },
  ],
};

describe('content references (decision 0116)', () => {
  it('finds the assets, pages and font families a page uses, nested elements and rich text included', () => {
    const found = contentReferences(doc);
    expect([...found.assetIds].sort()).toEqual(['asset-1', 'asset-2']);
    expect([...found.pageIds].sort()).toEqual(['page-a', 'page-b', 'page-c', 'page-d']);
    expect([...found.fontFamilyIds].sort()).toEqual([OTHER_FAMILY, FAMILY].sort());
  });

  it('finds nothing in nothing', () => {
    const found = contentReferences(undefined);
    expect(found.assetIds.size + found.pageIds.size + found.fontFamilyIds.size).toBe(0);
  });
});
