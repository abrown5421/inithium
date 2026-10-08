import { Checkbox, Container } from '@inithium/shared-ui-components';

export default function ExampleCheckboxBasic() {
  return (
    <Container flex={{ direction: 'column' }}>
      <Checkbox label="Email me about new features" />
      <Checkbox label="Remember me" defaultChecked />
      <Checkbox label="Show line numbers" helperText="Applies to every code block." />
    </Container>
  );
}
