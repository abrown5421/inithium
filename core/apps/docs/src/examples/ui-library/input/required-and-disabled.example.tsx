import { Container, Input } from '@inithium/shared-ui-components';

export default function ExampleInputRequiredAndDisabled() {
  return (
    <Container grid={{ columns: { base: 1, md: 3 }, align: 'end', gap: 16 }}>
      <Input label="Full name" required />
      <Input label="Account id" defaultValue="acct_4821" disabled />
      <Input variant="filled" label="Password" type="password" defaultValue="secret" disabled />
    </Container>
  );
}
