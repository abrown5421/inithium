import { useState } from 'react';
import type { PolyPattern } from '@inithium/shared-contracts';
import { Container, Text } from '@inithium/shared-ui-components';
import { PolyBanner } from '@inithium/shared-ui-composites';

export default function ExamplePolyBannerEditable() {
  const [pattern, setPattern] = useState<PolyPattern>({
    cellSize: 60,
    variance: 0.8,
    xColors: [
      { color: 'sky', intensity: 100 },
      { color: 'secondary', intensity: 500 },
      { color: 'indigo', intensity: 900 },
    ],
    seed: 'edit-me',
  });

  return (
    <Container flex={{ direction: 'column', gap: 12 }}>
      <PolyBanner editable value={pattern} onChange={setPattern} height={180} radius={{ all: 12 }} />
      <Text as="p" fontSize={12} textColor={{ color: 'surface', intensity: 700 }}>
        Saved recipe: {JSON.stringify(pattern)}
      </Text>
    </Container>
  );
}
