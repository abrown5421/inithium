import { Checkbox, Container } from '@inithium/shared-ui-components';

export default function ExampleCheckboxColours() {
  return (
    <Container flex={{ wrap: 'wrap', gap: 24 }}>
      <Checkbox label="Primary" defaultChecked />
      <Checkbox label="Secondary" color="secondary" defaultChecked />
      <Checkbox label="Emerald" color="emerald" defaultChecked />
      <Checkbox label="Violet 700" color={{ color: 'violet', intensity: 700 }} />
    </Container>
  );
}
