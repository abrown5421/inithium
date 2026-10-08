import { Container, Input } from '@inithium/shared-ui-components';

export default function ExampleInputColours() {
  return (
    <Container grid={{ columns: { base: 1, md: 3 }, gap: 16 }}>
      <Input label="Secondary" color="secondary" defaultValue="Focus me" />
      <Input variant="filled" label="Emerald" color="emerald" defaultValue="Focus me" />
      <Input variant="standard" label="Violet 700" color={{ color: 'violet', intensity: 700 }} defaultValue="Focus me" />
    </Container>
  );
}
