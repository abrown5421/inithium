import { Button, Container } from '@inithium/shared-ui-components';

export default function ExampleButtonVariants() {
  return (
    <Container flex={{ align: 'center', wrap: 'wrap', gap: 12 }}>
      <Button>Filled</Button>
      <Button variant="outlined">Outlined</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </Container>
  );
}
