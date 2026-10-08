import { Container, Switch } from '@inithium/shared-ui-components';

export default function ExampleSwitchDisabled() {
  return (
    <Container flex={{ wrap: 'wrap', gap: 24 }}>
      <Switch label="Off" disabled />
      <Switch label="On" defaultChecked disabled />
      <Switch label="With icons" checkedIcon="check" uncheckedIcon="x" defaultChecked disabled />
    </Container>
  );
}
