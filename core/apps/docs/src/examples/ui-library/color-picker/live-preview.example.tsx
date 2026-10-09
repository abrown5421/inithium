import { useState } from 'react';
import { Container, Icon, Text } from '@inithium/shared-ui-components';
import { ColorPicker, type PickedColor } from '@inithium/shared-ui-composites';

export default function ExampleColorPickerLivePreview() {
  const [background, setBackground] = useState<PickedColor>({ color: 'violet', intensity: 500 });
  return (
    <Container flex={{ align: 'center', gap: 24, wrap: 'wrap' }}>
      <Container flex={{ align: 'center', justify: 'center' }} width={96} height={96} radius={{ all: 999 }} bgColor={background}>
        <Icon name="user" size={40} textColor={{ color: 'surface', intensity: 50 }} />
      </Container>
      <Container width={280}>
        <ColorPicker label="Avatar background" value={background} onValueChange={setBackground} />
      </Container>
      <Text fontSize={14}>Stored as {JSON.stringify(background)}</Text>
    </Container>
  );
}
