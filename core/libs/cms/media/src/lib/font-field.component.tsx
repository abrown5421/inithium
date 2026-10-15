import type { FontFamilyValue } from '@inithium/shared-contracts';
import { useGetFontFamiliesQuery } from '@inithium/shared-data-access';
import { FontPicker, type FontPickerProps } from '@inithium/shared-ui-composites';

export type FontFieldProps = Omit<FontPickerProps, 'families' | 'value' | 'defaultValue' | 'onValueChange'> & {
  /** The chosen font: a theme role, `{ familyId }`, or undefined. */
  value?: FontFamilyValue;
  onChange: (value: FontFamilyValue | undefined) => void;
};

/**
 * A CMS form field holding one font (decision 0111): a FontPicker offering the theme's roles and every family in the
 * font library that has files. Use it wherever a CMS form stores a font. The CMS draws every family (CmsTheme), so each
 * option shows in its own font.
 */
export function FontField({ value, onChange, ...props }: FontFieldProps) {
  const { data: families = [] } = useGetFontFamiliesQuery();
  return (
    <FontPicker
      {...props}
      value={value}
      onValueChange={onChange}
      families={families.filter((family) => family.files.length > 0).map((family) => ({ id: family.id, name: family.name }))}
    />
  );
}
