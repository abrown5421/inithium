import { useState } from 'react';
import { Container, Switch, Text } from '@inithium/shared-ui-components';

export default function ExampleSwitchControlled() {
  const [autosave, setAutosave] = useState(true);
  return (
    <Container flex={{ direction: 'column', gap: 4 }}>
      <Switch label="Autosave" checked={autosave} onCheckedChange={setAutosave} />
      <Text fontSize={14}>{autosave ? 'Changes save as you type.' : 'Remember to save your changes.'}</Text>
    </Container>
  );
}
