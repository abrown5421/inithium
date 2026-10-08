import { useState } from 'react';
import { Container, Text } from '@inithium/shared-ui-components';

export default function ExampleSequence() {
  const [page, setPage] = useState(1);
  const [leaving, setLeaving] = useState(false);

  return (
    <Container flex={{ direction: 'column', gap: 12 }}>
      <Container role="button" tabIndex={0} onClick={() => setLeaving(true)} width="fit" padding={{ x: 12, y: 6 }} radius={{ all: 6 }} bgColor="primary">
        <Text as="span" textColor={{ color: 'primary', intensity: 50 }}>Next page</Text>
      </Container>
      <Container minHeight={64}>
        <Container
          key={page}
          show={!leaving}
          animation={{ entrance: { name: 'fadeInRight', speed: 400 }, exit: { name: 'fadeOutLeft', speed: 250 } }}
          onExitEnd={() => {
            setPage((current) => current + 1);
            setLeaving(false);
          }}
          padding={{ all: 16 }}
          radius={{ all: 8 }}
          bgColor={{ color: page % 2 ? 'primary' : 'accent', intensity: 100 }}
        >
          <Text>Page {page}: exits fully, then the next one enters</Text>
        </Container>
      </Container>
    </Container>
  );
}
