import { Button, Container, Divider } from '@inithium/shared-ui-components';

export default function ExampleDividerWithALabel() {
  return (
    <Container flex={{ direction: 'column', gap: 16 }} maxWidth={360}>
      <Button width="full">Sign in with email</Button>
      <Divider label="or continue with" />
      <Container grid={{ columns: 2, gap: 8 }}>
        <Button variant="outlined" color={{ color: 'surface', intensity: 700 }} leadingIcon="key-round">Passkey</Button>
        <Button variant="outlined" color={{ color: 'surface', intensity: 700 }} leadingIcon="link">Magic link</Button>
      </Container>
    </Container>
  );
}
