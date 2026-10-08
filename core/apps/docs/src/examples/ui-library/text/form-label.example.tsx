import { Container, Text } from '@inithium/shared-ui-components';

export default function ExampleLabel() {
  return (
    <Container flex={{ direction: 'column', gap: 4 }}>
      <Text as="label" htmlFor="email" fontWeight={600}>Email</Text>
      <input id="email" type="email" />
    </Container>
  );
}
