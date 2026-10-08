import { useState } from 'react';
import { Container, Text } from '@inithium/shared-ui-components';

export default function ExampleAttention() {
  const [shakes, setShakes] = useState(0);

  return (
    <Container flex={{ align: 'center', gap: 12, wrap: 'wrap' }}>
      <Container role="button" tabIndex={0} onClick={() => setShakes((value) => value + 1)} padding={{ x: 12, y: 6 }} radius={{ all: 6 }} bgColor="primary">
        <Text as="span" textColor={{ color: 'primary', intensity: 50 }}>Shake</Text>
      </Container>
      <Container animation={{ attention: { name: 'shakeX', speed: 'fast' } }} replay={shakes} padding={{ x: 16, y: 8 }} radius={{ all: 8 }} bgColor={{ color: 'secondary', intensity: 100 }}>
        <Text>Shaken {shakes} times</Text>
      </Container>
      <Container animation={{ attention: { name: 'pulse', repeat: 'infinite', speed: 'slow' } }} padding={{ x: 12, y: 4 }} radius={{ all: 999 }} bgColor="accent">
        <Text as="span" fontSize={13} fontWeight={700} textColor={{ color: 'accent', intensity: 950 }}>infinite pulse</Text>
      </Container>
    </Container>
  );
}
