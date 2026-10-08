import { useState } from 'react';
import { Button, Container } from '@inithium/shared-ui-components';

export default function ExampleButtonAnimation() {
  const [editing, setEditing] = useState(false);
  const [saves, setSaves] = useState(0);
  return (
    <Container flex={{ align: 'center', gap: 12 }}>
      <Button variant="ghost" leadingIcon={editing ? 'x' : 'pencil'} onClick={() => setEditing((value) => !value)}>
        {editing ? 'Stop editing' : 'Edit'}
      </Button>
      {/* Fades in when shown and out when hidden; unmounts after the exit. */}
      <Button
        leadingIcon="save"
        show={editing}
        animation={{ entrance: { name: 'fadeInUp', speed: 'fast' }, exit: { name: 'fadeOutDown', speed: 'fast' }, attention: { name: 'rubberBand' } }}
        replay={saves}
        onClick={() => setSaves((count) => count + 1)}
      >
        Save ({saves})
      </Button>
    </Container>
  );
}
