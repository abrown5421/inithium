import { Container, Text } from '@inithium/shared-ui-components';

export default function ExampleStickyHeader() {
  return (
    <Container as="header" position={{ type: 'sticky', top: 0, z: 10 }} padding={{ x: 16, y: 12 }} bgColor={{ color: 'surface', intensity: 50 }} shadow="sm">
      <Text fontWeight={700}>Site name</Text>
    </Container>
  );
}
