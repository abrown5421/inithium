import { FontField, FontSample } from '@inithium/cms-media';
import { Container, Text } from '@inithium/shared-ui-components';

/** The draft's value for Inithium's default font. */
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
  error?: string | true;
};

/**
 * Chooses the library family a theme role uses (decision 0111), or Inithium's default, with a sample drawn in it. A
 * FontField without the roles (a role can't point at a role); families without files aren't offered.
 */
export function ThemeFontField({ themeRole, value, onValueChange, error }: ThemeFontFieldProps) {
  const config = ROLES[themeRole];
  const familyId = value === DEFAULT_FONT ? undefined : value;
  return (
    <Container flex={{ direction: 'column', gap: 12 }} minWidth={0}>
      <FontField
        name={`fonts.${themeRole}`}
        label={config.label}
        helperText={config.helperText}
        roles={false}
        emptyLabel={`Inithium’s default (${config.defaultName})`}
        value={familyId ? { familyId } : undefined}
        onChange={(next) => onValueChange(next && typeof next === 'object' ? next.familyId : DEFAULT_FONT)}
        error={error}
      />
      <Container padding={{ all: 16 }} radius={{ all: 8 }} bgColor={{ color: 'surface', intensity: 100 }} minWidth={0}>
        {familyId ? (
          <Text as="span" fontFamily={{ familyId }} fontSize={config.size} lineHeight={1.3}>
            {config.sample}
          </Text>
        ) : (
          // Inithium's own font, not whatever the role currently uses: only FontSample can name it directly.
          <FontSample cssName={config.defaultCssName} fallback="sans">
            <Text as="span" fontSize={config.size} lineHeight={1.3}>
              {config.sample}
            </Text>
          </FontSample>
        )}
      </Container>
    </Container>
  );
}
