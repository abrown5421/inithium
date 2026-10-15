import { useMemo } from 'react';
import { fontFaceCss, type FontFaceSource } from '@inithium/shared-contracts';

/** Font files to declare under one CSS family name. */
export type FontFaceSet = { cssName: string; files: readonly FontFaceSource[] };

/**
 * Declares uploaded font files with `@font-face` rules (decision 0111), so text can be drawn in them. A declared file
 * only downloads once text uses it, so declaring a whole library costs nothing until then.
 */
export function FontFaces({ sets }: { sets: readonly FontFaceSet[] }) {
  const css = useMemo(() => sets.map((set) => fontFaceCss(set.cssName, set.files)).join('\n'), [sets]);
  return css ? <style>{css}</style> : null;
}
