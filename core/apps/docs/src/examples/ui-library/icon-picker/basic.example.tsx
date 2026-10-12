import { useState } from 'react';
import { Container, Icon, Text, type IconName } from '@inithium/shared-ui-components';
import { IconPicker } from '@inithium/shared-ui-composites';

export default function ExampleIconPickerBasic() {
  const [icon, setIcon] = useState<IconName | undefined>();
  return (
    <Container flex={{ direction: 'column', gap: 12 }} maxWidth={360}>
      <IconPicker label="Menu icon" value={icon} onValueChange={setIcon} />
      <Container flex={{ align: 'center', gap: 8 }}>
        <Text as="span" fontSize={14}>Chosen:</Text>
        {icon ? <Icon name={icon} size={20} /> : null}
        <Text as="span" fontSize={14}>{icon ?? 'nothing yet'}</Text>
      </Container>
    </Container>
  );
}
