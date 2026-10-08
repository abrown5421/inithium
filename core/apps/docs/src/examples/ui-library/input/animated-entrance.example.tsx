import { useState } from 'react';
import { Button, Container, Input } from '@inithium/shared-ui-components';

export default function ExampleInputAnimation() {
  const [adding, setAdding] = useState(false);
  return (
    <Container flex={{ direction: 'column', gap: 12 }} maxWidth={360}>
      <Button variant="ghost" leadingIcon={adding ? 'minus' : 'plus'} onClick={() => setAdding((value) => !value)}>
        {adding ? 'Remove a second email' : 'Add a second email'}
      </Button>
      <Input
        label="Second email"
        type="email"
        show={adding}
        animation={{ entrance: { name: 'fadeInDown', speed: 'fast' }, exit: { name: 'fadeOutUp', speed: 'fast' } }}
      />
    </Container>
  );
}
