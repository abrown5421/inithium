import { Container, Switch } from '@inithium/shared-ui-components';

export default function ExampleSwitchBasic() {
  return (
    <Container flex={{ direction: 'column' }}>
      <Switch label="Wi-Fi" defaultChecked />
      <Switch label="Bluetooth" />
      <Switch label="Airplane mode" helperText="Turns off every wireless connection." />
    </Container>
  );
}
