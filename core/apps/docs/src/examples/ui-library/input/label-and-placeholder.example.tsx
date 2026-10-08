import { Container, Input } from '@inithium/shared-ui-components';

export default function ExampleInputLabelAndPlaceholder() {
  return (
    <Container grid={{ columns: { base: 1, md: 3 }, gap: 16 }}>
      <Input label="Label only" />
      <Input label="Label and placeholder" placeholder="Shown once focused" />
      <Input placeholder="Placeholder only" aria-label="Placeholder only" />
    </Container>
  );
}
