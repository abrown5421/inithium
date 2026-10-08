import { Container, Text } from '@inithium/shared-ui-components';

export default function ExampleRevealOnScroll() {
  return (
    <Container flex={{ direction: 'column', gap: 160 }} padding={{ y: 80 }}>
      {['First', 'Second', 'Third'].map((label) => (
        <Container key={label} animation={{ entrance: { name: 'fadeInUp', when: 'inView' } }} padding={{ all: 16 }} radius={{ all: 8 }} bgColor={{ color: 'secondary', intensity: 100 }}>
          <Text>{label} card: fades up the first time it scrolls into view</Text>
        </Container>
      ))}
    </Container>
  );
}
