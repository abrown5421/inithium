import { Container, Text } from '@inithium/shared-ui-components';

export default function ExampleGrid() {
  return (
    <Container grid={{ columns: { base: 1, md: 3 }, gap: 16 }}>
      <Container gridItem={{ colSpan: { base: 1, md: 2 } }} bgColor="secondary" padding={{ all: 16 }} radius={{ all: 8 }}>
        <Text textColor={{ color: 'secondary', intensity: 50 }}>Wide</Text>
      </Container>
      <Container bgColor="tertiary" padding={{ all: 16 }} radius={{ all: 8 }}>
        <Text textColor={{ color: 'tertiary', intensity: 50 }}>Narrow</Text>
      </Container>
    </Container>
  );
}
