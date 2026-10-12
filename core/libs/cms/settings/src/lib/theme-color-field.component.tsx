import { useMemo } from 'react';
import type { ThemeColor } from '@inithium/shared-contracts';
import { Container, Input, Text } from '@inithium/shared-ui-components';
import { generateBrandScale, generateSurfaceScale, scaleSteps } from '@inithium/shared-ui-theme';

const HEX = /^#?[0-9a-f]{6}$/i;

/** A typed hex colour as stored: with its '#', lowercased. */
export const normalizeHex = (value: string) => {
  const trimmed = value.trim().toLowerCase();
  return trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
};

export type ThemeColorFieldProps = {
  token: ThemeColor;
  /** The typed hex, e.g. '#006a8e' (the '#' is optional while typing). */
  value: string;
  onValueChange: (value: string) => void;
  error?: string | true;
};

/**
 * One theme colour (decision 0087): a hex field with a swatch, and a row of the scale generated from it, the
 * client's own step (500 for brand tokens, 100 for surface) outlined.
 */
export function ThemeColorField({ token, value, onValueChange, error }: ThemeColorFieldProps) {
  const isSurface = token === 'surface';
  const step = isSurface ? 100 : 500;
  const valid = HEX.test(value.trim());
  const scale = useMemo(() => {
    if (!valid) return null;
    const hex = normalizeHex(value);
    return isSurface ? generateSurfaceScale(hex) : generateBrandScale(hex);
  }, [valid, value, isSurface]);
  const label = `${token[0].toUpperCase()}${token.slice(1)}`;

  return (
    <Container flex={{ direction: 'column', gap: 8 }}>
      <Input
        name={`theme.colors.${token}`}
        label={`${label} (${step})`}
        value={value}
        onValueChange={onValueChange}
        error={error}
        autoComplete="off"
        spellCheck={false}
        helperText={isSurface ? 'The 100: the page background. Text and borders come from the darker steps.' : 'The 500: the colour as your brand uses it.'}
        endAdornment={
          <span
            aria-hidden="true"
            style={{
              width: 20,
              height: 20,
              borderRadius: 4,
              border: '1px solid color-mix(in oklab, var(--color-surface-500) 50%, transparent)',
              background: valid ? normalizeHex(value) : 'transparent',
            }}
          />
        }
      />
      {scale ? (
        <div role="img" aria-label={`${label} scale from 50 to 950`} style={{ display: 'grid', gridTemplateColumns: 'repeat(11, 1fr)', gap: 2 }}>
          {scaleSteps.map((scaleStep) => (
            <span
              key={scaleStep}
              title={`${scaleStep} ${scale[scaleStep]}`}
              style={{
                height: 20,
                borderRadius: 3,
                background: scale[scaleStep],
                outline: scaleStep === step ? '2px solid var(--color-surface-900)' : undefined,
                outlineOffset: 1,
              }}
            />
          ))}
        </div>
      ) : (
        <Text as="p" fontSize={12} textColor={{ color: 'surface', intensity: 700 }}>
          Enter a 6-digit hex colour to preview its scale.
        </Text>
      )}
    </Container>
  );
}
