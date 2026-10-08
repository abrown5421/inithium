import { Container, Input } from '@inithium/shared-ui-components';

export default function ExampleInputPassword() {
  return (
    <Container grid={{ columns: { base: 1, md: 2 }, align: 'end', gap: 16 }}>
      <Input label="Password" type="password" autoComplete="new-password" defaultValue="correct horse" />
      <Input variant="filled" label="Password" type="password" leadingIcon="lock" autoComplete="new-password" />
    </Container>
  );
}
