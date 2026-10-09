import { Container } from '@inithium/shared-ui-components';
import { ColorPicker } from '@inithium/shared-ui-composites';

export default function ExampleColorPickerVariants() {
  return (
    <Container grid={{ columns: { base: 1, md: 3 }, align: 'end', gap: 16 }}>
      <ColorPicker label="Outlined" defaultValue={{ color: 'sky', intensity: 400 }} />
      <ColorPicker variant="filled" label="Filled" defaultValue={{ color: 'amber', intensity: 300 }} />
      <ColorPicker variant="standard" label="Standard" color="secondary" />
    </Container>
  );
}
