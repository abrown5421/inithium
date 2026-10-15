import { describe, expect, it } from 'vitest';
import { bioSchema } from '../users/users.schema';
import { contentBlockSchema } from './content-blocks.schema';
import { restrictedRichTextSchema, richTextDocumentSchema, richTextFeaturesUsed, type RichTextDocument } from './rich-text.schema';

const FAMILY = '0123456789abcdef01234567';

const styled = (attrs: Record<string, unknown>): RichTextDocument =>
  ({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Grand opening', marks: [{ type: 'textStyle', attrs }] }] }] }) as RichTextDocument;

describe('restyled words in rich text (decision 0115)', () => {
  it('take a font, weight, size ratio and colour', () => {
    expect(richTextDocumentSchema.safeParse(styled({ family: { familyId: FAMILY }, weight: 800, size: 1.5, color: { color: 'primary', intensity: 600 } })).success).toBe(true);
    expect(richTextDocumentSchema.safeParse(styled({ family: 'display' })).success).toBe(true);
  });

  it('refuse an empty style, a size out of range, an unknown weight or a made-up family', () => {
    expect(richTextDocumentSchema.safeParse(styled({})).success).toBe(false);
    expect(richTextDocumentSchema.safeParse(styled({ size: 5 })).success).toBe(false);
    expect(richTextDocumentSchema.safeParse(styled({ weight: 450 })).success).toBe(false);
    expect(richTextDocumentSchema.safeParse(styled({ family: { familyId: 'red;}' } })).success).toBe(false);
    expect(richTextDocumentSchema.safeParse(styled({ family: 'display', fontSize: 12 })).success).toBe(false);
  });

  it('count each attribute as its own feature, so fields can allow some or none', () => {
    expect([...richTextFeaturesUsed(styled({ weight: 700, color: 'accent' }))].sort()).toEqual(['fontWeight', 'textColor']);
    expect(restrictedRichTextSchema({ features: ['fontWeight'] }).safeParse(styled({ weight: 700 })).success).toBe(true);
    expect(restrictedRichTextSchema({ features: ['fontWeight'] }).safeParse(styled({ weight: 700, size: 2 })).success).toBe(false);
    // The profile bio allows none of them.
    expect(bioSchema.safeParse(styled({ family: 'display' })).success).toBe(false);
  });
});

describe('block typography (decision 0115)', () => {
  it('lets each text part set a font, weight and size, all optional', () => {
    const heading = { id: 'h1', type: 'heading', text: 'Hi', level: 2, typography: { fontFamily: { familyId: FAMILY }, fontWeight: 300, fontSize: { base: 32, md: 56 } } };
    expect(contentBlockSchema.safeParse(heading).success).toBe(true);
    const feature = { id: 'f1', type: 'feature', icon: 'star', title: 'Fast', titleTypography: { fontWeight: 800 }, titleColor: 'accent', textTypography: {} };
    expect(contentBlockSchema.safeParse(feature).success).toBe(true);
    const caption = { id: 'i1', type: 'image', assetId: 'a', decorative: true, caption: 'x', captionColor: 'secondary', captionTypography: { fontFamily: 'display' } };
    expect(contentBlockSchema.safeParse(caption).success).toBe(true);
  });

  it('refuses sizes out of range and stray keys', () => {
    expect(contentBlockSchema.safeParse({ id: 'h1', type: 'heading', text: 'Hi', level: 2, typography: { fontSize: { base: 4 } } }).success).toBe(false);
    expect(contentBlockSchema.safeParse({ id: 'h1', type: 'heading', text: 'Hi', level: 2, typography: { color: 'red' } }).success).toBe(false);
    // Buttons stay out of page-builder typography.
    const buttons = { id: 'b1', type: 'buttons', buttons: [{ id: 'x', label: 'Go', link: { type: 'url', href: 'https://a.b' }, typography: {} }] };
    expect(contentBlockSchema.safeParse(buttons).success).toBe(false);
  });
});
