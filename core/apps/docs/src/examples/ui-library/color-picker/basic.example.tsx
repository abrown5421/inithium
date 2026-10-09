import { Container } from '@inithium/shared-ui-components';
import { ColorPicker } from '@inithium/shared-ui-composites';

export default function ExampleColorPickerBasic() {
  return (
    <Container maxWidth={360}>
      <ColorPicker label="Accent colour" defaultValue={{ color: 'emerald', intensity: 500 }} />
    </Container>
  );
}
