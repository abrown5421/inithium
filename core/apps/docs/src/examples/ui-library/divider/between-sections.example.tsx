import { Container, Divider, Text } from '@inithium/shared-ui-components';

export default function ExampleDividerBetweenSections() {
  return (
    <Container flex={{ direction: 'column' }} maxWidth={480}>
      <Text as="h3" fontWeight={700}>Profile</Text>
      <Text fontSize={14}>Your name, photo and bio.</Text>
      <Divider margin={{ y: 16 }} />
      <Text as="h3" fontWeight={700}>Security</Text>
      <Text fontSize={14}>Password and two-step verification.</Text>
    </Container>
  );
}
