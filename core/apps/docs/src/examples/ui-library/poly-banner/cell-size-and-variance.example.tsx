import type { PolyPattern } from '@inithium/shared-contracts';
import { Container, Text } from '@inithium/shared-ui-components';
import { PolyBanner } from '@inithium/shared-ui-composites';

const base: PolyPattern = {
  cellSize: 75,
  variance: 0.75,
  xColors: [
    { color: 'tertiary', intensity: 300 },
    { color: 'tertiary', intensity: 700 },
  ],
  yColors: [
    { color: 'amber', intensity: 200 },
    { color: 'tertiary', intensity: 900 },
  ],
  seed: 'compare',
};

const variations: { caption: string; change: Partial<PolyPattern> }[] = [
  { caption: 'Cell size 25', change: { cellSize: 25 } },
  { caption: 'Cell size 150', change: { cellSize: 150 } },
  { caption: 'Variance 0', change: { variance: 0 } },
  { caption: 'Variance 1', change: { variance: 1 } },
];

export default function ExamplePolyBannerCellSizeAndVariance() {
  return (
    <Container grid={{ columns: 2, gap: 12 }}>
      {variations.map(({ caption, change }) => (
        <Container key={caption} flex={{ direction: 'column', gap: 4 }}>
          <PolyBanner height={110} radius={{ all: 8 }} defaultValue={{ ...base, ...change }} />
          <Text as="span" fontSize={12}>
            {caption}
          </Text>
        </Container>
      ))}
    </Container>
  );
}
