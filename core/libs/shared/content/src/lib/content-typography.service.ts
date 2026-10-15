import type { ContentTypography, FontFamilyValue, Variants } from '@inithium/shared-contracts';

type Defaults = { fontFamily?: FontFamilyValue; fontWeight?: ContentTypography['fontWeight']; fontSize?: Variants<number> };

/**
 * A text part's Text props from its typography (decision 0115), each falling back to the part's default: the block's
 * own font, weight and size when it sets them, today's look when it doesn't.
 */
export function typographyProps(typography: ContentTypography | undefined, defaults: Defaults = {}) {
  const size = typography?.fontSize;
  return {
    fontFamily: typography?.fontFamily ?? defaults.fontFamily,
    fontWeight: typography?.fontWeight ?? defaults.fontWeight,
    fontSize: size ? (size.md === undefined ? size.base : { base: size.base, md: size.md }) : defaults.fontSize,
  };
}
