import { describe, expect, it } from 'vitest';
import { contentDocumentSchema } from '../content.schema';
import type { ContentBlock, ContentDocumentV1, ContentElement, ContentSection } from '../content.types';
import { richTextFromPlainText } from '../rich-text.schema';
import { upgradeContentV1 } from './content-v1-upgrade.service';

const section = (blocks: ContentBlock[], extra: Partial<ContentSection> = {}): ContentSection =>
  ({ id: 's', layout: 'one', columns: [{ id: 'col', blocks }], ...extra }) as ContentSection;

/** Upgrades one section and checks the result is valid version 2 content. */
function upgrade(...sections: ContentSection[]): ContentElement[] {
  const doc: ContentDocumentV1 = { schemaVersion: 1, sections };
  const upgraded = upgradeContentV1(doc);
  const parsed = contentDocumentSchema.safeParse(upgraded);
  expect(parsed.error?.issues).toBeUndefined();
  return upgraded.elements;
}

/** The elements a single-column section holds. */
const childrenOf = (blocks: ContentBlock[]) => {
  const [band] = upgrade(section(blocks));
  return band?.type === 'container' ? band.children : [];
};

describe('upgrading version 1 content (decision 0116)', () => {
  it('turns a single-column section into a full-width Container holding its blocks', () => {
    const [band] = upgrade(section([{ id: 'd', type: 'divider' }], { bgColor: 'accent', anchor: 'about', entrance: { name: 'fadeIn' } }));
    expect(band).toEqual({
      id: 's',
      type: 'container',
      props: {
        as: 'section',
        anchor: 'about',
        width: 'full',
        padding: { y: 48, x: 24 },
        bgColor: 'accent',
        animation: { entrance: { name: 'fadeIn' } },
        flex: { direction: 'column', gap: 20 },
      },
      children: [{ id: 'd', type: 'divider', props: {} }],
    });
  });

  it('keeps columns’ shares of the width, stacking below the section’s breakpoint', () => {
    const [band] = upgrade({
      id: 's',
      layout: 'one-third-two-thirds',
      stackBelow: 'lg',
      maxWidth: 1200,
      gap: 40,
      verticalAlign: 'center',
      columns: [
        { id: 'a', blocks: [] },
        { id: 'b', blocks: [] },
      ],
    });
    if (band?.type !== 'container') throw new Error('expected a Container');
    expect(band.props.flex).toEqual({ direction: 'column', align: 'center' });
    const row = band.children[0];
    if (row?.type !== 'container') throw new Error('expected a row');
    expect(row.id).toBe('s-row');
    expect(row.props).toEqual({
      width: 'full',
      maxWidth: 1200,
      flex: { direction: { base: 'column', lg: 'row' }, align: { base: 'stretch', lg: 'center' }, gap: 40 },
    });
    expect(row.children.map((column) => column.type === 'container' && [column.id, column.props.flexItem?.grow])).toEqual([
      ['a', { base: 0, lg: 1 }],
      ['b', { base: 0, lg: 2 }],
    ]);
  });

  it('keeps a single column’s width limit in a centred Container', () => {
    const [band] = upgrade(section([], { maxWidth: 800 }));
    if (band?.type !== 'container') throw new Error('expected a Container');
    expect(band.children[0]).toEqual({ id: 's-row', type: 'container', props: { width: 'full', maxWidth: 800, flex: { direction: 'column', gap: 20 } }, children: [] });
  });

  it('turns headings into Text, keeping their sizes', () => {
    const [title, subheading] = childrenOf([
      { id: 'h1', type: 'heading', level: 1, text: 'Privacy policy' },
      { id: 'h2', type: 'heading', level: 2, text: 'About', align: 'center', typography: { fontWeight: 300 } },
    ]);
    expect(title).toEqual({
      id: 'h1',
      type: 'text',
      props: { doc: { type: 'doc', content: [{ type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Privacy policy' }] }] } },
    });
    expect(subheading?.type === 'text' && subheading.props.headingTypography).toEqual({ fontSize: { base: 28, md: 34 }, fontWeight: 300 });
  });

  it('turns rich text into Text, keeping the space above a heading at its start', () => {
    const plain = richTextFromPlainText('Hello');
    const headed = { type: 'doc' as const, content: [{ type: 'heading' as const, attrs: { level: 2 as const }, content: [{ type: 'text' as const, text: 'Hi' }] }] };
    const [first, second] = childrenOf([
      { id: 'a', type: 'rich-text', doc: plain, typography: { fontSize: { base: 18 } } },
      { id: 'b', type: 'rich-text', doc: headed },
    ]);
    expect(first).toEqual({ id: 'a', type: 'text', props: { doc: plain, typography: { fontSize: { base: 18 } } } });
    expect(second?.type === 'text' && second.props.margin).toEqual({ top: 8 });
  });

  it('turns a buttons block into a row of Buttons', () => {
    const [row] = childrenOf([
      { id: 'bs', type: 'buttons', align: 'center', buttons: [{ id: 'b1', label: 'Go', icon: 'mail', variant: 'outlined', link: { type: 'url', href: 'mailto:a@b.c' } }] },
    ]);
    expect(row).toEqual({
      id: 'bs',
      type: 'container',
      props: { flex: { direction: 'row', wrap: 'wrap', gap: 12, justify: 'center' } },
      children: [{ id: 'b1', type: 'button', props: { label: 'Go', link: { type: 'url', href: 'mailto:a@b.c' }, variant: 'outlined', leadingIcon: 'mail' } }],
    });
  });

  it('keeps an image’s settings', () => {
    const [image] = childrenOf([{ id: 'i', type: 'image', assetId: 'a1', alt: 'View', width: 320, radius: 8, align: 'start', caption: 'Hi' }]);
    expect(image).toEqual({ id: 'i', type: 'image', props: { assetId: 'a1', alt: 'View', caption: 'Hi', width: 320, align: 'start', radius: { all: 8 } } });
  });

  it('turns a spacer into an empty Container of its height', () => {
    expect(childrenOf([{ id: 'sp', type: 'spacer', height: 64 }])).toEqual([{ id: 'sp', type: 'container', props: { height: 64 }, children: [] }]);
  });

  it('turns a feature into a Container holding an Icon and Text', () => {
    const [feature] = childrenOf([{ id: 'f', type: 'feature', icon: 'star', title: 'Fast', text: 'Very', align: 'center' }]);
    if (feature?.type !== 'container') throw new Error('expected a Container');
    expect(feature.props.flex).toEqual({ direction: 'column', align: 'center', gap: 10 });
    expect(feature.children.map((child) => `${child.type}:${child.id}`)).toEqual(['icon:f-icon', 'text:f-title', 'text:f-text']);
    const title = feature.children[1];
    expect(title?.type === 'text' && title.props.headingTypography).toEqual({ fontFamily: 'body', fontWeight: 600, fontSize: { base: 18 } });
  });

  it('draws a banner’s pattern as its first colour, until the PolyBanner element exists', () => {
    const pattern = { cellSize: 90, variance: 0.7, xColors: [{ color: 'primary', intensity: 700 }, { color: 'secondary', intensity: 500 }], seed: 'x' } as const;
    const [banner] = childrenOf([{ id: 'bn', type: 'banner', pattern: { ...pattern, xColors: [...pattern.xColors] }, height: 220, heading: 'Hello' }]);
    if (banner?.type !== 'container') throw new Error('expected a Container');
    expect(banner.props.bgColor).toEqual({ color: 'primary', intensity: 700 });
    expect(banner.props.height).toBe(220);
    expect(banner.children.map((child) => child.id)).toEqual(['bn-heading']);
    const [band] = upgrade(section([], { bgColor: 'accent', banner: { ...pattern, xColors: [...pattern.xColors] } }));
    expect(band?.type === 'container' && band.props.bgColor).toEqual({ color: 'primary', intensity: 700 });
  });

  it('turns “hide on” into hidden variants at the section’s breakpoint', () => {
    const [divider] = upgrade(section([{ id: 'd', type: 'divider', hideOn: { phone: true } }], { stackBelow: 'lg' }))
      .flatMap((band) => (band.type === 'container' ? band.children : []));
    expect(divider?.type === 'divider' && divider.props.hidden).toEqual({ base: true, lg: false });
  });

  it('gives the same result every time', () => {
    const doc: ContentDocumentV1 = { schemaVersion: 1, sections: [section([{ id: 'f', type: 'feature', icon: 'star', title: 'Fast' }])] };
    expect(upgradeContentV1(doc)).toEqual(upgradeContentV1(doc));
  });
});
