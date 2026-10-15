import { useState } from 'react';
import { Button, Container, Text } from '@inithium/shared-ui-components';
import { Menu } from '@inithium/shared-ui-composites';

export default function ExampleMenuShortcutsAndDanger() {
  const [last, setLast] = useState('nothing yet');
  return (
    <Container flex={{ direction: 'row', align: 'center', gap: 16 }}>
      <Menu
        aria-label="Actions for Card"
        align="end"
        items={[
          { label: 'Duplicate', icon: 'copy-plus', shortcut: 'Ctrl+D', onSelect: () => setLast('Duplicate') },
          { label: 'Copy', icon: 'copy', shortcut: 'Ctrl+C', onSelect: () => setLast('Copy') },
          'separator',
          { label: 'Delete', icon: 'trash-2', shortcut: 'Del', danger: true, onSelect: () => setLast('Delete') },
        ]}
      >
        <Button variant="ghost" leadingIcon="ellipsis" aria-label="Actions for Card" padding={{ x: 6 }} />
      </Menu>
      <Text as="p">Chosen: {last}</Text>
    </Container>
  );
}
