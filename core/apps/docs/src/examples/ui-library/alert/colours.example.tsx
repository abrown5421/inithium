import { Container } from '@inithium/shared-ui-components';
import { Alert } from '@inithium/shared-ui-composites';

export default function ExampleAlertColours() {
  return (
    <Container grid={{ columns: { base: 1, md: 2 }, gap: 12 }}>
      <Alert message="Primary (the default)" />
      <Alert color="secondary" message="Secondary" />
      <Alert color="violet" message="Violet" />
      <Alert color={{ color: 'surface', intensity: 500 }} message="Surface, for neutral notes" />
    </Container>
  );
}
