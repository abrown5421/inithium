import { useState } from 'react';
import { Button, Container, Text } from '@inithium/shared-ui-components';
import { Menu } from '@inithium/shared-ui-composites';

export default function ExampleMenuGroupsAndDescriptions() {
  const [last, setLast] = useState('nothing yet');
  return (
    <Container flex={{ direction: 'row', align: 'center', gap: 16 }}>
      <Menu
        aria-label="Things to add"
        items={[
          { heading: 'Layout' },
          { label: 'Container', icon: 'square-dashed', description: 'Holds other things in a stack, a row or a grid', onSelect: () => setLast('Container') },
          'separator',
          { heading: 'Text and media' },
          { label: 'Text', icon: 'type', description: 'Headings, paragraphs, lists and quotes', onSelect: () => setLast('Text') },
          { label: 'Image', icon: 'image', description: 'A picture from the library', onSelect: () => setLast('Image') },
        ]}
      >
        <Button leadingIcon="plus">Add</Button>
      </Menu>
      <Text as="p">Chosen: {last}</Text>
    </Container>
  );
}
