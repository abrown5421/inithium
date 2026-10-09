import { Container, Divider } from '@inithium/shared-ui-components';

export default function ExampleDividerLooks() {
  return (
    <Container flex={{ direction: 'column', gap: 20 }}>
      <Divider />
      <Divider color="primary" />
      <Divider color="emerald" thickness={2} />
      <Divider color={{ color: 'surface', intensity: 700 }} lineStyle="dashed" />
      <Divider color="accent" thickness={3} lineStyle="dotted" />
    </Container>
  );
}
