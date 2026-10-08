import { Button, Container } from '@inithium/shared-ui-components';

export default function ExampleButtonWidths() {
  return (
    <Container flex={{ direction: 'column', gap: 12 }} maxWidth={320}>
      <Button type="submit" width="full">Sign in</Button>
      <Button variant="outlined" width="full" color={{ color: 'surface', intensity: 700 }}>Create an account</Button>
      <Container flex={{ justify: 'end', gap: 8 }}>
        <Button variant="ghost" color={{ color: 'surface', intensity: 700 }}>Cancel</Button>
        <Button minWidth={96}>Save</Button>
      </Container>
    </Container>
  );
}
