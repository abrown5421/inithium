import { describe, expect, it } from 'vitest';
import { richTextFromPlainText, type ContentDocument, type ContentElement, type RichTextDocument } from '@inithium/shared-contracts';
import { composite, contrastRatio, emptyTextWarnings, headingWarnings, requiredContrast } from './accessibility-checks.service';

const headings = (id: string, ...levels: (1 | 2 | 3 | 4)[]): ContentElement => ({
  id,
  type: 'text',
  props: { doc: { type: 'doc', content: levels.map((level) => ({ type: 'heading', attrs: { level }, content: [{ type: 'text', text: `H${level}` }] })) } as RichTextDocument },
});
const page = (...elements: ContentElement[]): ContentDocument => ({ schemaVersion: 2, elements });

describe('the page builder’s accessibility warnings (decision 0116)', () => {
  it('measures contrast as WCAG does', () => {
    expect(contrastRatio([0, 0, 0, 1], [255, 255, 255, 1])).toBeCloseTo(21, 0);
    expect(contrastRatio([255, 255, 255, 1], [255, 255, 255, 1])).toBe(1);
    // #767676 on white is the classic just-passing grey.
    expect(contrastRatio([0x76, 0x76, 0x76, 1], [255, 255, 255, 1])).toBeGreaterThanOrEqual(4.5);
  });

  it('mixes see-through colours into what’s behind them', () => {
    expect(composite([0, 0, 0, 0.5], [255, 255, 255, 1])).toEqual([127.5, 127.5, 127.5, 1]);
  });

  it('asks 3:1 of large text and 4.5:1 of the rest', () => {
    expect(requiredContrast(16, 400)).toBe(4.5);
    expect(requiredContrast(24, 400)).toBe(3);
    expect(requiredContrast(19, 700)).toBe(3);
    expect(requiredContrast(19, 400)).toBe(4.5);
  });

  it('warns when headings skip a level going down the page, across elements', () => {
    expect(headingWarnings(page(headings('a', 1, 2, 3), headings('b', 2, 3)))).toEqual([]);
    expect(headingWarnings(page(headings('a', 2), { id: 'box', type: 'container', props: {}, children: [headings('b', 4)] }))).toEqual([
      expect.objectContaining({ elementId: 'b', check: 'heading', message: expect.stringContaining('Make it Heading 3') }),
    ]);
    expect(headingWarnings(page(headings('a', 3)))).toHaveLength(1);
  });

  it('warns about empty Text', () => {
    expect(emptyTextWarnings(page({ id: 't', type: 'text', props: { doc: richTextFromPlainText('  ') } }))).toEqual([expect.objectContaining({ elementId: 't', check: 'empty' })]);
    expect(emptyTextWarnings(page({ id: 't', type: 'text', props: { doc: richTextFromPlainText('Hello') } }))).toEqual([]);
  });
});
