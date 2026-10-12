import { Container } from '@inithium/shared-ui-components';
import { IconPicker } from '@inithium/shared-ui-composites';

export default function ExampleIconPickerRequiredAndError() {
  return (
    <Container flex={{ direction: 'column', gap: 16 }} maxWidth={360}>
      <IconPicker label="Category icon" required error="Choose an icon for this category" />
      <IconPicker label="Disabled" defaultValue="lock" disabled />
    </Container>
  );
}
