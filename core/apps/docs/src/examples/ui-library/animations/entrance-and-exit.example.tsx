import { useState } from 'react';
import { Container, Text } from '@inithium/shared-ui-components';

export default function ExampleEntranceAndExit() {
  const [show, setShow] = useState(true);
  const [events, setEvents] = useState<string[]>([]);
  const log = (event: string) => setEvents((current) => [event, ...current].slice(0, 3));

  return (
    <Container flex={{ direction: 'column', gap: 12 }}>
      <Container role="button" tabIndex={0} onClick={() => setShow((value) => !value)} width="fit" padding={{ x: 12, y: 6 }} radius={{ all: 6 }} bgColor="primary">
        <Text as="span" textColor={{ color: 'primary', intensity: 50 }}>{show ? 'Hide' : 'Show'}</Text>
      </Container>
      <Container minHeight={64}>
        <Container
          show={show}
          animation={{ entrance: { name: 'fadeInUp', speed: 'fast' }, exit: { name: 'fadeOutDown', speed: 'faster' } }}
          onEntranceEnd={() => log('onEntranceEnd')}
          onExitEnd={() => log('onExitEnd (unmounted)')}
          padding={{ all: 16 }}
          radius={{ all: 8 }}
          bgColor={{ color: 'secondary', intensity: 100 }}
        >
          <Text>fadeInUp (fast) / fadeOutDown (faster)</Text>
        </Container>
      </Container>
      <Text fontSize={13} textColor={{ color: 'surface', intensity: 700 }}>
        Events: {events.length ? events.join(' · ') : 'none yet'}
      </Text>
    </Container>
  );
}
