import { useState } from 'react';
import { Button, Container } from '@inithium/shared-ui-components';

export default function ExampleButtonAnimation() {
  const [saves, setSaves] = useState(0);
  return (
    <Container flex={{ align: 'center', gap: 12 }}>
      <Button animation={{ entrance: { name: 'fadeInUp' } }}>Fades in</Button>
      <Button
        variant="outlined"
        leadingIcon="save"
        animation={{ attention: { name: 'rubberBand', speed: 'fast' } }}
        replay={saves}
        onClick={() => setSaves((count) => count + 1)}
      >
        Save ({saves})
      </Button>
    </Container>
  );
}
