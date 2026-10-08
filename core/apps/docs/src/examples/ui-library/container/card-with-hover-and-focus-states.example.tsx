import { Container, Text } from '@inithium/shared-ui-components';

export default function ExampleCard() {
  return (
    <Container
      tabIndex={0}
      padding={{ all: 16 }}
      radius={{ all: 12 }}
      bgColor={{ base: { color: 'surface', intensity: 50 }, hover: { color: 'primary', intensity: 100 } }}
      borderWidth={{ all: 2 }}
      borderColor={{ base: { color: 'surface', intensity: 500, opacity: 40 }, focus: { color: 'accent', intensity: 500 } }}
      shadow={{ base: 'sm', hover: 'lg' }}
    >
      <Text textColor={{ color: 'surface', intensity: 900 }}>Card</Text>
    </Container>
  );
}
