import { Mark } from '@tiptap/react';
import { fontFamilyVariable, richTextStyleAttrsSchema, type FontFamilyValue, type RichTextStyleAttrs } from '@inithium/shared-contracts';
import { toCssColor } from '@inithium/shared-ui-components';

/** TipTap's name for restyled words (decision 0115); our contract calls the mark `textStyle`. */
export const RICH_TEXT_STYLE_MARK = 'inithiumTextStyle';

/** A font family value as CSS: a role's variable, or a library family's with the body font as its fallback. */
export const fontFamilyCss = (family: FontFamilyValue) =>
  typeof family === 'string' ? `var(--font-${family})` : `var(${fontFamilyVariable(family.familyId)}, var(--font-body))`;

/** The mark's attributes if they pass the contract, else undefined (so nothing unchecked reaches a style attribute). */
export function checkedStyleAttrs(attrs: Record<string, unknown> | undefined): RichTextStyleAttrs | undefined {
  const present = Object.fromEntries(Object.entries(attrs ?? {}).filter(([, value]) => value !== null && value !== undefined));
  const parsed = richTextStyleAttrsSchema.safeParse(present);
  return parsed.success ? parsed.data : undefined;
}

/** The inline CSS for restyled words, as the editor draws them. */
export function richTextStyleCss(attrs: RichTextStyleAttrs): string {
  return [
    attrs.family !== undefined ? `font-family: ${fontFamilyCss(attrs.family)}` : '',
    attrs.weight !== undefined ? `font-weight: ${attrs.weight}` : '',
    attrs.size !== undefined ? `font-size: ${attrs.size}em` : '',
    attrs.color !== undefined ? `color: ${toCssColor(attrs.color)}` : '',
  ]
    .filter(Boolean)
    .join('; ');
}

/**
 * Restyled words in the editor (decision 0115): TipTap's own font and colour extensions store raw CSS, so this mark
 * holds the contract's references (a role or `{ familyId }`, a weight, a size ratio, a colour value) and draws them
 * through the theme's CSS variables. It only reads back its own spans, so styling pasted from elsewhere is dropped.
 */
export const RichTextStyle = Mark.create({
  name: RICH_TEXT_STYLE_MARK,

  addAttributes() {
    const attribute = { default: null, rendered: false };
    return { family: attribute, weight: attribute, size: attribute, color: attribute };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-text-style]',
        getAttrs: (element) => {
          try {
            return checkedStyleAttrs(JSON.parse(element.getAttribute('data-text-style') ?? '')) ?? false;
          } catch {
            return false;
          }
        },
      },
    ];
  },

  renderHTML({ mark }) {
    const attrs = checkedStyleAttrs(mark.attrs);
    return attrs ? ['span', { 'data-text-style': JSON.stringify(attrs), style: richTextStyleCss(attrs) }, 0] : ['span', 0];
  },
});
