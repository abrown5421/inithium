import { useState } from 'react';
import { Container, Text } from '@inithium/shared-ui-components';

export default function ExampleOverlay() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Container role="button" tabIndex={0} onClick={() => setOpen(true)} padding={{ x: 12, y: 6 }} radius={{ all: 6 }} bgColor="primary" width="fit">
        <Text as="span" textColor={{ color: 'primary', intensity: 50 }}>Open overlay</Text>
      </Container>
      <Container
        show={open}
        position={{ type: 'fixed', all: 0, z: 50 }}
        flex={{ align: 'center', justify: 'center' }}
        bgColor={{ color: 'quaternary', intensity: 950, opacity: 60 }}
        animation={{ entrance: { name: 'fadeIn', speed: 'faster' }, exit: { name: 'fadeOut', speed: 'faster' } }}
        onClick={() => setOpen(false)}
      >
        <Container padding={{ all: 24 }} radius={{ all: 12 }} bgColor={{ color: 'surface', intensity: 50 }} animation={{ entrance: { name: 'zoomIn', speed: 'fast' } }}>
          <Text>Click anywhere to close</Text>
        </Container>
      </Container>
    </>
  );
}
