import { Container } from '@inithium/shared-ui-components';
import { IconPicker } from '@inithium/shared-ui-composites';

export default function ExampleIconPickerPresetAndHelper() {
  return (
    <Container flex={{ direction: 'column', gap: 16 }} maxWidth={360}>
      <IconPicker label="Navigation icon" defaultValue="house" helperText="Shown beside the link in menus." />
      <IconPicker label="Filled variant" variant="filled" defaultValue="calendar" color="secondary" />
    </Container>
  );
}
