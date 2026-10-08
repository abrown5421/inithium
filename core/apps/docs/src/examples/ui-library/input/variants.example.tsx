import { Container, Input } from '@inithium/shared-ui-components';

export default function ExampleInputVariants() {
  return (
    <Container grid={{ columns: { base: 1, md: 3 }, align: 'end', gap: 16 }}>
      <Input label="Outlined" />
      <Input variant="filled" label="Filled" />
      <Input variant="standard" label="Standard" />
    </Container>
  );
}
