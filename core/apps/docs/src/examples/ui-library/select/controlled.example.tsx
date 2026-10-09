import { useState } from 'react';
import { Container, Select, Text } from '@inithium/shared-ui-components';

const speeds = [
  { value: '0.5', label: '0.5×' },
  { value: '1', label: 'Normal' },
  { value: '1.5', label: '1.5×' },
  { value: '2', label: '2×' },
];

export default function ExampleSelectControlled() {
  const [speed, setSpeed] = useState('1');
  return (
    <Container flex={{ direction: 'column', gap: 8 }} maxWidth={240}>
      <Select label="Playback speed" value={speed} onValueChange={setSpeed} options={speeds} />
      <Text fontSize={14}>A 10-minute video takes {Math.round(10 / Number(speed))} minutes.</Text>
    </Container>
  );
}
