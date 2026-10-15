import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import type { RichTextDocument } from '@inithium/shared-contracts';
import { RichTextView } from './rich-text-view.component';

const FAMILY = '0123456789abcdef01234567';

describe('<RichTextView /> typography (decision 0115)', () => {
  afterEach(cleanup);

  it('draws restyled words inside bold, so their weight wins', () => {
    const doc: RichTextDocument = {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Sale', marks: [{ type: 'bold' }, { type: 'textStyle', attrs: { family: { familyId: FAMILY }, weight: 300, size: 2 } }] }] }],
    };
    render(<RichTextView doc={doc} />);
    const words = screen.getByText('Sale');
    const styles = words.getAttribute('style') ?? '';
    expect(styles).toContain(`var(--font-family-${FAMILY}, var(--font-body))`);
    expect(styles).toContain('300');
    expect(styles).toContain('2em');
    expect(words.parentElement?.tagName).toBe('STRONG');
  });

  it('gives the running text the block’s typography, but not sub-headings', () => {
    const doc: RichTextDocument = {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Title' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Body copy' }] },
      ],
    };
    render(<RichTextView doc={doc} typography={{ fontFamily: { familyId: FAMILY }, fontSize: { base: 15, md: 18 } }} />);
    expect(screen.getByText('Body copy').getAttribute('style')).toContain(`var(--font-family-${FAMILY}, var(--font-body))`);
    expect(screen.getByText('Body copy').getAttribute('style')).toContain('18px');
    expect(screen.getByText('Title').getAttribute('style')).toContain('var(--font-display)');
  });
});
