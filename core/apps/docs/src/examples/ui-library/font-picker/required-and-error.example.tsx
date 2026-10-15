import { Container } from '@inithium/shared-ui-components';
import { FontPicker } from '@inithium/shared-ui-composites';

export default function ExampleFontPickerRequiredAndError() {
  return (
    <Container flex={{ direction: 'column', gap: 16 }} maxWidth={360}>
      <FontPicker label="Font" required error="Choose a font" />
      <FontPicker label="Disabled" defaultValue="body" disabled />
    </Container>
  );
}
