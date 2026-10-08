import { Container, Switch } from '@inithium/shared-ui-components';

export default function ExampleSwitchColours() {
  return (
    <Container flex={{ wrap: 'wrap', gap: 24 }}>
      <Switch label="Primary" defaultChecked />
      <Switch label="Secondary" color="secondary" defaultChecked />
      <Switch label="Emerald" color="emerald" defaultChecked />
      <Switch label="Violet 700" color={{ color: 'violet', intensity: 700 }} defaultChecked />
    </Container>
  );
}
