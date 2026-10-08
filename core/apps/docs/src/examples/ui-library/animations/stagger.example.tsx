import { useState } from 'react';
import { Container, Text } from '@inithium/shared-ui-components';

export default function ExampleStagger() {
  const [run, setRun] = useState(0);

  return (
    <Container flex={{ direction: 'column', gap: 12 }}>
      <Container role="button" tabIndex={0} onClick={() => setRun((value) => value + 1)} width="fit" padding={{ x: 12, y: 6 }} radius={{ all: 6 }} bgColor="primary">
        <Text as="span" textColor={{ color: 'primary', intensity: 50 }}>Replay</Text>
      </Container>
      <Container key={run} grid={{ columns: 3, gap: 8 }} stagger={120}>
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <Container key={n} animation={{ entrance: { name: 'zoomIn', speed: 'fast' } }} padding={{ all: 16 }} radius={{ all: 8 }} bgColor={{ color: 'secondary', intensity: 100 }}>
            <Text align="center">{n}</Text>
          </Container>
        ))}
      </Container>
    </Container>
  );
}
