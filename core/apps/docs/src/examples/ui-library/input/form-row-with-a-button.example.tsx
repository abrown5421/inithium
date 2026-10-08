import { Button, Container, Input } from '@inithium/shared-ui-components';

export default function ExampleInputFormRow() {
  return (
    <Container flex={{ direction: 'column', gap: 16 }}>
      {/* Outlined fields are exactly as tall as a button. */}
      <Container flex={{ align: 'center', gap: 8 }}>
        <Input label="Email" type="email" leadingIcon="mail" />
        <Button>Subscribe</Button>
      </Container>
      {/* Filled and standard labels float above the field, so align the row by its bottom edge. */}
      <Container flex={{ align: 'end', gap: 8 }}>
        <Input variant="filled" label="Coupon code" />
        <Button variant="outlined">Apply</Button>
      </Container>
    </Container>
  );
}
