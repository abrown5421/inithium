import { Container } from '@inithium/shared-ui-components';
import { ColorPicker } from '@inithium/shared-ui-composites';

export default function ExampleColorPickerThemeOnly() {
  return (
    <Container maxWidth={360}>
      <ColorPicker label="Brand colour" palette="theme" placeholder="Pick a theme colour" />
    </Container>
  );
}
