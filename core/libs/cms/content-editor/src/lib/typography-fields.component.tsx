import { fontWeightLabel, type ContentTypography } from '@inithium/shared-contracts';
import { FontField, useFontWeights, type FontWeight } from '@inithium/cms-media';
import { Container, Select, Slider, Switch } from '@inithium/shared-ui-components';

const DEFAULT = 'default';

export type TypographyFieldsProps = {
  /** Names the text part, e.g. 'Title'; leave out for a block with one text part. */
  part?: string;
  value: ContentTypography | undefined;
  onChange: (value: ContentTypography | undefined) => void;
  /** The size switched on first, and what the part uses while the size is off. */
  defaultSize: { base: number; md?: number };
};

/** A typography object without empty keys, or undefined when nothing's set, so documents only store real choices. */
function tidy(value: ContentTypography): ContentTypography | undefined {
  const entries = Object.entries(value).filter(([, entry]) => entry !== undefined);
  return entries.length ? (Object.fromEntries(entries) as ContentTypography) : undefined;
}

/**
 * A text part's font, weight and size in the content editor (decision 0115). The font is a FontField with a "Default"
 * option; the weight lists only the weights the chosen font has; the size is off (the part's default) or a size for
 * phones and one for wider screens, in px.
 */
export function TypographyFields({ part, value, onChange, defaultSize }: TypographyFieldsProps) {
  const weights = useFontWeights(value?.fontFamily);
  const change = (next: Partial<ContentTypography>) => onChange(tidy({ ...value, ...next }));
  const name = (what: string) => (part ? `${part} ${what.toLowerCase()}` : what);
  const size = value?.fontSize;

  return (
    <Container flex={{ direction: 'column', gap: 14 }}>
      <FontField label={name('Font')} emptyLabel="Default" value={value?.fontFamily} onChange={(fontFamily) => change({ fontFamily })} />
      <Select
        label={name('Weight')}
        value={value?.fontWeight ? String(value.fontWeight) : DEFAULT}
        onValueChange={(weight) => change({ fontWeight: weight === DEFAULT ? undefined : (Number(weight) as FontWeight) })}
        options={[
          { value: DEFAULT, label: 'Default' },
          ...weights.map((weight) => ({ value: String(weight), label: fontWeightLabel({ min: weight, max: weight }) })),
        ]}
        helperText={value?.fontWeight && !weights.includes(value.fontWeight) ? 'This font doesn’t have that weight, so the browser imitates it.' : undefined}
      />
      <Switch
        label={`Custom ${name('Size').toLowerCase()}`}
        helperText="Off keeps the default size."
        checked={size !== undefined}
        onCheckedChange={(on) => change({ fontSize: on ? { ...defaultSize } : undefined })}
      />
      {size && (
        <>
          <Slider
            label={name('Size on phones')}
            min={8}
            max={160}
            step={1}
            value={size.base}
            formatValue={(px) => `${px}px`}
            onValueChange={(base) => change({ fontSize: { ...size, base } })}
          />
          <Switch
            label="Larger screens use another size"
            checked={size.md !== undefined}
            onCheckedChange={(on) => change({ fontSize: on ? { base: size.base, md: Math.min(160, Math.round(size.base * 1.25)) } : { base: size.base } })}
          />
          {size.md !== undefined && (
            <Slider
              label={name('Size on wider screens')}
              min={8}
              max={160}
              step={1}
              value={size.md}
              formatValue={(px) => `${px}px`}
              onValueChange={(md) => change({ fontSize: { ...size, md } })}
            />
          )}
        </>
      )}
    </Container>
  );
}
