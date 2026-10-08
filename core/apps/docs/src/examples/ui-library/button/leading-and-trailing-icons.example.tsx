import { Button, Container } from '@inithium/shared-ui-components';

export default function ExampleButtonIcons() {
  return (
    <Container flex={{ align: 'center', wrap: 'wrap', gap: 12 }}>
      <Button leadingIcon="plus">New page</Button>
      <Button variant="outlined" trailingIcon="arrow-right">Continue</Button>
      <Button variant="ghost" color="rose" leadingIcon="trash-2">Delete</Button>
      <Button variant="ghost" leadingIcon="settings" aria-label="Settings" padding={{ x: 6 }} />
    </Container>
  );
}
