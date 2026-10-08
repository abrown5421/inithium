import { useState, type KeyboardEvent, type ReactNode } from 'react';
import { Container, Text } from '@inithium/shared-ui-components';

// Part of the placeholder home page: exercises the animation prop (decision 0048).

/** A clickable Container for the demo; a real Button component comes with the form controls. */
function DemoButton({ label, onPress }: { label: string; onPress: () => void }) {
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onPress();
    }
  };
  return (
    <Container
      role="button"
      tabIndex={0}
      onClick={onPress}
      onKeyDown={onKeyDown}
      padding={{ x: 16, y: 8 }}
      radius={{ all: 8 }}
      bgColor={{ base: 'primary', hover: { color: 'primary', intensity: 600 }, active: { color: 'primary', intensity: 700 } }}
      borderWidth={{ all: 2 }}
      borderColor={{ base: 'transparent', focus: { color: 'accent', intensity: 500 } }}
    >
      <Text as="span" fontWeight={600} textColor={{ color: 'primary', intensity: 50 }}>
        {label}
      </Text>
    </Container>
  );
}

function Demo({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Container
      flex={{ direction: 'column', gap: 12 }}
      padding={{ all: 16 }}
      radius={{ all: 12 }}
      bgColor={{ color: 'surface', intensity: 50 }}
      borderWidth={{ all: 1 }}
      borderColor={{ color: 'surface', intensity: 500, opacity: 40 }}
    >
      <Text fontWeight={700} textColor={{ color: 'surface', intensity: 900 }}>
        {title}
      </Text>
      {children}
    </Container>
  );
}

const card = { padding: { all: 16 }, radius: { all: 8 }, bgColor: { color: 'secondary', intensity: 100 } } as const;

export function AnimationPreview() {
  // show + callbacks
  const [show, setShow] = useState(true);
  const [events, setEvents] = useState<string[]>([]);
  const logEvent = (event: string) => setEvents((current) => [event, ...current].slice(0, 4));

  // page-shell sequence: the current page exits fully before the next one enters
  const [page, setPage] = useState(1);
  const [leaving, setLeaving] = useState(false);

  // attention replay, stagger replay
  const [shakes, setShakes] = useState(0);
  const [staggerRun, setStaggerRun] = useState(0);

  return (
    <Container grid={{ columns: { base: 1, md: 2 }, gap: 16 }}>
      <Demo title="show: entrance and exit">
        <DemoButton label={show ? 'Hide' : 'Show'} onPress={() => setShow((current) => !current)} />
        <Container minHeight={72}>
          <Container
            {...card}
            show={show}
            animation={{ entrance: { name: 'fadeInUp', speed: 'fast' }, exit: { name: 'fadeOutDown', speed: 'faster' } }}
            onEntranceEnd={() => logEvent('onEntranceEnd')}
            onExitEnd={() => logEvent('onExitEnd (now unmounted)')}
          >
            <Text textColor={{ color: 'secondary', intensity: 900 }}>fadeInUp (fast) / fadeOutDown (faster)</Text>
          </Container>
        </Container>
        <Text fontSize={13} textColor={{ color: 'surface', intensity: 700 }}>
          Events: {events.length ? events.join(' · ') : 'none yet'}
        </Text>
      </Demo>

      <Demo title="Page-shell sequence">
        <DemoButton label="Next page" onPress={() => setLeaving(true)} />
        <Container minHeight={72}>
          <Container
            key={page}
            {...card}
            bgColor={{ color: page % 2 ? 'primary' : 'accent', intensity: 100 }}
            show={!leaving}
            animation={{ entrance: { name: 'fadeInRight', speed: 400 }, exit: { name: 'fadeOutLeft', speed: 250 } }}
            onExitEnd={() => {
              setPage((current) => current + 1);
              setLeaving(false);
            }}
          >
            <Text textColor={{ color: 'surface', intensity: 900 }}>Page {page}: exits fully (250ms), then the next enters (400ms)</Text>
          </Container>
        </Container>
      </Demo>

      <Demo title="Attention and replay">
        <Container flex={{ align: 'center', gap: 12, wrap: 'wrap' }}>
          <DemoButton label="Shake" onPress={() => setShakes((current) => current + 1)} />
          <Container {...card} animation={{ attention: { name: 'shakeX', speed: 'fast' } }} replay={shakes}>
            <Text textColor={{ color: 'secondary', intensity: 900 }}>Shaken {shakes} times</Text>
          </Container>
          <Container
            padding={{ x: 12, y: 4 }}
            radius={{ all: 999 }}
            bgColor="accent"
            animation={{ attention: { name: 'pulse', repeat: 'infinite', speed: 'slow' } }}
          >
            <Text as="span" fontSize={13} fontWeight={700} textColor={{ color: 'accent', intensity: 950 }}>
              infinite pulse
            </Text>
          </Container>
        </Container>
      </Demo>

      <Demo title="Stagger">
        <DemoButton label="Replay" onPress={() => setStaggerRun((current) => current + 1)} />
        <Container key={staggerRun} grid={{ columns: 3, gap: 8 }} stagger={120}>
          {Array.from({ length: 6 }, (_, i) => (
            <Container key={i} {...card} animation={{ entrance: { name: 'zoomIn', speed: 'fast' } }}>
              <Text align="center" textColor={{ color: 'secondary', intensity: 900 }}>
                {i + 1}
              </Text>
            </Container>
          ))}
        </Container>
      </Demo>

      <Container gridItem={{ colSpan: 'full' }}>
        <Demo title="Enter when scrolled into view">
          <Text textColor={{ color: 'surface', intensity: 700 }}>Scroll down: each card fades up the first time it comes into view.</Text>
          <Container flex={{ direction: 'column', gap: 160 }} padding={{ y: 80 }}>
            {['First', 'Second', 'Third'].map((label) => (
              <Container key={label} {...card} animation={{ entrance: { name: 'fadeInUp', when: 'inView' } }}>
                <Text textColor={{ color: 'secondary', intensity: 900 }}>{label} card</Text>
              </Container>
            ))}
          </Container>
        </Demo>
      </Container>
    </Container>
  );
}
