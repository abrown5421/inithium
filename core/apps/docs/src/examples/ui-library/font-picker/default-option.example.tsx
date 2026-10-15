import { Container } from '@inithium/shared-ui-components';
import { FontPicker } from '@inithium/shared-ui-composites';
import { ThemeFonts } from '@inithium/shared-ui-theme';

const families = [{ id: 'aaaaaaaaaaaaaaaaaaaaaaaa', name: 'Classic Serif', fallback: 'serif' as const, files: [] }];

export default function ExampleFontPickerDefaultOption() {
  return (
    <Container flex={{ direction: 'column', gap: 16 }} maxWidth={360}>
      <ThemeFonts families={families} />
      <FontPicker label="Heading font" emptyLabel="Block default" families={families} helperText="Leave it on the default to follow the block." />
      <FontPicker label="Library only" roles={false} families={families} defaultValue={{ familyId: 'aaaaaaaaaaaaaaaaaaaaaaaa' }} variant="filled" color="secondary" />
    </Container>
  );
}
