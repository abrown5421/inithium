import { Container, Loader } from '@inithium/shared-ui-components';

export default function ExampleLoaderColoursAndSizes() {
  return (
    <Container flex={{ align: 'center', wrap: 'wrap', gap: 24 }}>
      <Loader size={16} />
      <Loader size={32} color="secondary" />
      <Loader size={48} color="emerald" />
      <Loader variant="dots" size={40} color="accent" />
      <Loader variant="bars" size={32} color={{ color: 'violet', intensity: 700 }} />
      <Loader variant="pulse" size={48} color="rose" />
    </Container>
  );
}
