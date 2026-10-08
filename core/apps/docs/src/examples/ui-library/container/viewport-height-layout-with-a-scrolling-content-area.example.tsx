import { Container, Text } from '@inithium/shared-ui-components';

export default function ExampleAppShell() {
  return (
    <Container height="screen" flex={{ direction: 'column' }}>
      <Container as="nav" height={64} padding={{ x: 16 }} flex={{ align: 'center' }} borderWidth={{ bottom: 1 }}>
        <Text>Navbar</Text>
      </Container>
      <Container as="main" flexItem={{ grow: 1 }} minHeight={0} overflow={{ y: 'auto' }} padding={{ all: 16 }}>
        <Text>Long content scrolls here.</Text>
      </Container>
    </Container>
  );
}
