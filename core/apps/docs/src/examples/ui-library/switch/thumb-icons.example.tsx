import { Container, Switch } from '@inithium/shared-ui-components';

export default function ExampleSwitchThumbIcons() {
  return (
    <Container flex={{ direction: 'column' }}>
      <Switch label="Notifications" checkedIcon="check" uncheckedIcon="x" defaultChecked />
      <Switch label="Dark theme" checkedIcon="moon" uncheckedIcon="sun" color="violet" />
      <Switch label="Private profile" checkedIcon="lock" uncheckedIcon="lock-open" color="emerald" defaultChecked />
    </Container>
  );
}
