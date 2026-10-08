import { Container, Text } from '@inithium/shared-ui-components';

export default function ExampleHeadings() {
  return (
    <Container flex={{ direction: 'column', gap: 8 }}>
      <Text as="h1" fontFamily="display" fontSize={{ base: 32, md: 48 }} lineHeight={1.1} textColor="primary">Page title</Text>
      <Text as="h2" fontSize={{ base: 22, md: 28 }} fontWeight={700} textColor={{ color: 'surface', intensity: 900 }}>Section</Text>
      <Text as="h3" fontSize={18} fontWeight={600} textColor={{ color: 'surface', intensity: 900 }}>Subsection</Text>
    </Container>
  );
}
