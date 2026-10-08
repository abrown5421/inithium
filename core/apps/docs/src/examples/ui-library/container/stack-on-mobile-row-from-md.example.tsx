import { Container, Text } from '@inithium/shared-ui-components';

export default function ExampleResponsiveRow() {
  return (
    <Container flex={{ direction: { base: 'column', md: 'row' }, align: 'center', gap: { base: 8, md: 24 } }}>
      <Text>First</Text>
      <Text>Second</Text>
      <Text>Third</Text>
    </Container>
  );
}
