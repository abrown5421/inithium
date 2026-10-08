import { Checkbox, Container } from '@inithium/shared-ui-components';

export default function ExampleCheckboxDisabled() {
  return (
    <Container flex={{ wrap: 'wrap', gap: 24 }}>
      <Checkbox label="Unchecked" disabled />
      <Checkbox label="Checked" defaultChecked disabled />
      <Checkbox label="Indeterminate" checked="indeterminate" disabled />
    </Container>
  );
}
