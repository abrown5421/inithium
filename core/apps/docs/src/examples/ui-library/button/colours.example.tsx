import { Button, Container } from '@inithium/shared-ui-components';

export default function ExampleButtonColours() {
  return (
    <Container flex={{ direction: 'column', gap: 12 }}>
      <Container flex={{ wrap: 'wrap', gap: 12 }}>
        <Button color="primary">Primary</Button>
        <Button color="secondary">Secondary</Button>
        <Button color="accent">Accent</Button>
        <Button color={{ color: 'primary', intensity: 700 }}>Primary 700</Button>
      </Container>
      <Container flex={{ wrap: 'wrap', gap: 12 }}>
        <Button variant="outlined" color="emerald">Emerald</Button>
        <Button variant="outlined" color="rose">Rose</Button>
        <Button variant="ghost" color="sky">Sky</Button>
        <Button variant="link" color="violet">Violet</Button>
      </Container>
    </Container>
  );
}
