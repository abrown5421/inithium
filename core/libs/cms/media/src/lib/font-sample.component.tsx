import type { ReactNode } from 'react';
import { fontStack, type FontFallback } from '@inithium/shared-contracts';

export type FontSampleProps = {
  /** The CSS family name the font's files are declared under (see `FontFaces`). */
  cssName: string;
  fallback: FontFallback;
  weight?: number;
  italic?: boolean;
  children: ReactNode;
};

/**
 * Draws its children in an uploaded font. A plain <span> sets the family: Text only takes the theme's two roles until it
 * takes library families (decision 0112), so the Text inside inherits the font from here.
 */
export function FontSample({ cssName, fallback, weight, italic, children }: FontSampleProps) {
  return <span style={{ fontFamily: fontStack(cssName, fallback), fontWeight: weight, fontStyle: italic ? 'italic' : 'normal', minWidth: 0 }}>{children}</span>;
}
