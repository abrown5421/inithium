import { Container, Text } from '@inithium/shared-ui-components';

export default function ExamplePageColumn() {
  return (
    <Container as="main" minHeight="screen" flex={{ direction: 'column', align: 'center' }} bgColor={{ color: 'surface', intensity: 100 }}>
      <Container width="full" maxWidth={1120} padding={{ base: { x: 16, y: 32 }, md: { x: 32, y: 48 } }}>
        <Text>Page content</Text>
      </Container>
    </Container>
  );
}
