import { Container, Text } from '@inithium/shared-ui-components';

export default function ExampleCascade() {
  return (
    <Container grid={{ columns: 3, gap: 8 }} stagger={120}>
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <Container key={n} padding={{ all: 16 }} radius={{ all: 8 }} bgColor={{ color: 'secondary', intensity: 100 }}
          animation={{ entrance: { name: 'zoomIn', speed: 'fast', when: 'inView' } }}>
          <Text align="center">{n}</Text>
        </Container>
      ))}
    </Container>
  );
}
