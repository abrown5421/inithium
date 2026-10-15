import { fontFamilyCssName, type FontFamilyRecord } from '@inithium/shared-contracts';
import { FontSample } from '@inithium/cms-media';
import { Container, Select, Text } from '@inithium/shared-ui-components';

/** The Select's value for Inithium's default font (Radix selects can't hold an empty value). */
export const DEFAULT_FONT = 'default';

const ROLES = {
  display: {
    label: 'Display font',
    helperText: 'Branding and headings.',
    defaultName: 'Bruno Ace SC',
    defaultCssName: 'Inithium Display',
    sample: 'Headings look like this',
    size: 28,
  },
  body: {
    label: 'Body font',
    helperText: 'All running text, on the site and in the CMS. Choose one that’s easy to read.',
    defaultName: 'Merriweather Sans',
    defaultCssName: 'Inithium Body',
    sample: 'Paragraphs, buttons, menus and forms read like this, so it should stay clear at small sizes.',
    size: 16,
  },
} as const;

export type ThemeFontFieldProps = {
  themeRole: 'display' | 'body';
  /** A family id, or DEFAULT_FONT. */
  value: string;
  onValueChange: (value: string) => void;
  families: readonly FontFamilyRecord[];
  error?: string | true;
};

/**
 * Chooses the library family a theme role uses (decision 0111), or Inithium's default, with a sample drawn in it.
 * Families without files can't be chosen. The CMS declares every family (CmsTheme), so the sample draws at once.
 */
export function ThemeFontField({ themeRole, value, onValueChange, families, error }: ThemeFontFieldProps) {
  const config = ROLES[themeRole];
  const family = families.find((candidate) => candidate.id === value);
  return (
    <Container flex={{ direction: 'column', gap: 12 }} minWidth={0}>
      <Select
        name={`fonts.${themeRole}`}
        label={config.label}
        helperText={config.helperText}
        value={value}
        onValueChange={onValueChange}
        options={[
          { value: DEFAULT_FONT, label: `Inithium’s default (${config.defaultName})` },
          ...families.map((candidate) => ({
            value: candidate.id,
            label: candidate.files.length ? candidate.name : `${candidate.name} (no files)`,
            disabled: !candidate.files.length,
          })),
        ]}
        error={error}
      />
      <Container padding={{ all: 16 }} radius={{ all: 8 }} bgColor={{ color: 'surface', intensity: 100 }} minWidth={0}>
        <FontSample cssName={family ? fontFamilyCssName(family.id) : config.defaultCssName} fallback={family?.fallback ?? 'sans'}>
          <Text as="span" fontSize={config.size} lineHeight={1.3}>
            {config.sample}
          </Text>
        </FontSample>
      </Container>
    </Container>
  );
}
