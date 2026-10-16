import { richTextIsEmpty, type ContentDocument } from '@inithium/shared-contracts';
import { allElements } from './content-tree.service';

/*
 * The page builder's accessibility warnings (decision 0116): text that's hard to read against its background,
 * headings that skip a level, and empty text. They only warn: they never stop saving or publishing.
 */

export type AccessibilityCheck = 'contrast' | 'heading' | 'empty';

export type AccessibilityWarning = { elementId: string; check: AccessibilityCheck; message: string };

/** A colour as red, green and blue (0–255) and alpha (0–1). */
export type Rgba = [number, number, number, number];

/** A colour's relative luminance (WCAG 2): 0 for black, 1 for white. */
export function relativeLuminance([r, g, b]: Rgba): number {
  const channel = (value: number) => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** The contrast between two opaque colours (WCAG 2), from 1:1 to 21:1. */
export function contrastRatio(a: Rgba, b: Rgba): number {
  const [light, dark] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x) as [number, number];
  return (light + 0.05) / (dark + 0.05);
}

/** A colour drawn over another: the second must be opaque. */
export function composite(top: Rgba, bottom: Rgba): Rgba {
  const a = top[3];
  return [top[0] * a + bottom[0] * (1 - a), top[1] * a + bottom[1] * (1 - a), top[2] * a + bottom[2] * (1 - a), 1];
}

/** The contrast WCAG AA asks of text: 3:1 for large text (24px, or 18.66px bold), 4.5:1 otherwise. */
export const requiredContrast = (fontSizePx: number, fontWeight: number): number => (fontSizePx >= 24 || (fontSizePx >= 18.66 && fontWeight >= 700) ? 3 : 4.5);

/** The heading levels in a rich text document, in order. */
const headingLevels = (doc: Parameters<typeof richTextIsEmpty>[0]): number[] =>
  doc.content.flatMap((node) => (node.type === 'heading' ? [node.attrs.level] : []));

/**
 * Headings that skip a level going down the page, e.g. a Heading 4 straight after a Heading 2. Screen reader users
 * move by headings, so a skipped level reads as something missing. The page may start at Heading 1 or 2.
 */
export function headingWarnings(doc: ContentDocument): AccessibilityWarning[] {
  const warnings: AccessibilityWarning[] = [];
  let previous = 1;
  for (const element of allElements(doc.elements)) {
    if (element.type !== 'text') continue;
    for (const level of headingLevels(element.props.doc)) {
      if (level > previous + 1) {
        warnings.push({
          elementId: element.id,
          check: 'heading',
          message: `Heading ${level} comes after Heading ${previous}, skipping a level. Make it Heading ${previous + 1}.`,
        });
      }
      previous = level;
    }
  }
  return warnings;
}

/** Text elements with nothing in them. */
export function emptyTextWarnings(doc: ContentDocument): AccessibilityWarning[] {
  return allElements(doc.elements).flatMap((element) =>
    element.type === 'text' && richTextIsEmpty(element.props.doc)
      ? [{ elementId: element.id, check: 'empty' as const, message: 'This Text is empty: screen readers announce it as nothing. Type in it, or delete it.' }]
      : [],
  );
}

/** A warning for text measured at too little contrast. */
export const contrastWarning = (elementId: string, ratio: number, needed: number): AccessibilityWarning => ({
  elementId,
  check: 'contrast',
  message: `Hard to read: its text has ${ratio.toFixed(1)}:1 contrast with what’s behind it, and needs ${needed}:1. Darken or lighten the text or the background.`,
});
