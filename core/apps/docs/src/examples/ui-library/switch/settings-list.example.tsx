import { Container, Switch } from '@inithium/shared-ui-components';

const settings = [
  { label: 'Email notifications', helperText: 'A summary of activity on your pages.', on: true },
  { label: 'Weekly digest', helperText: 'Every Monday morning.', on: false },
  { label: 'Product updates', helperText: 'New features and improvements.', on: true },
];

export default function ExampleSwitchSettingsList() {
  return (
    <Container as="ul" maxWidth={420} radius={{ all: 8 }} borderWidth={{ all: 1 }} borderColor={{ color: 'surface', intensity: 500, opacity: 40 }}>
      {settings.map((setting, index) => (
        <Container
          as="li"
          key={setting.label}
          padding={{ x: 16, y: 8 }}
          borderWidth={{ top: index === 0 ? 0 : 1 }}
          borderColor={{ color: 'surface', intensity: 500, opacity: 40 }}
        >
          <Switch label={setting.label} helperText={setting.helperText} labelPlacement="start" defaultChecked={setting.on} />
        </Container>
      ))}
    </Container>
  );
}
