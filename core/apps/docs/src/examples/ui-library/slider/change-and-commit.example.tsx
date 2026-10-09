import { useState } from 'react';
import { Container, Slider, Text } from '@inithium/shared-ui-components';

export default function ExampleSliderChangeAndCommit() {
  const [brightness, setBrightness] = useState(70);
  const [saved, setSaved] = useState(70);
  return (
    <Container flex={{ direction: 'column', gap: 8 }} maxWidth={360}>
      <Slider
        label="Brightness"
        value={brightness}
        onValueChange={setBrightness}
        onValueCommit={setSaved}
        formatValue={(value) => `${value}%`}
      />
      <Text fontSize={14}>Live: {brightness}% · Saved when you let go: {saved}%</Text>
    </Container>
  );
}
