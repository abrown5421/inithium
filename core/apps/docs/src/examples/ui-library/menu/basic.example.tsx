import { useState } from 'react';
import { Button, Container, Text } from '@inithium/shared-ui-components';
import { Menu } from '@inithium/shared-ui-composites';

export default function ExampleMenuBasic() {
  const [last, setLast] = useState('nothing yet');
  return (
    <Container flex={{ direction: 'row', align: 'center', gap: 16 }}>
      <Menu
        aria-label="Page actions"
        items={[
          { label: 'Edit', icon: 'pencil', onSelect: () => setLast('Edit') },
          { label: 'Duplicate', icon: 'copy-plus', onSelect: () => setLast('Duplicate') },
          { label: 'Share', icon: 'share-2', onSelect: () => setLast('Share'), disabled: true },
        ]}
      >
        <Button variant="outlined" trailingIcon="chevron-down">
          Actions
        </Button>
      </Menu>
      <Text as="p">Chosen: {last}</Text>
    </Container>
  );
}
