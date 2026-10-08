import { Container, Input, Text } from '@inithium/shared-ui-components';

export default function ExampleLabel() {
  return (
    <Container flex={{ direction: 'column', gap: 4 }} maxWidth={360}>
      {/* A fixed label above the field, instead of Input's floating label. */}
      <Text as="label" htmlFor="newsletter-email" fontWeight={600}>Email</Text>
      <Input id="newsletter-email" type="email" placeholder="name@example.com" />
    </Container>
  );
}
