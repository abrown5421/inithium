import { useState } from 'react';
import type { FontFamilyValue } from '@inithium/shared-contracts';
import { Container, Text } from '@inithium/shared-ui-components';
import { FontPicker } from '@inithium/shared-ui-composites';
import { ThemeFonts } from '@inithium/shared-ui-theme';

// Two library families with no files, so each draws in its fallback type's system fonts (a serif and a monospace).
const families = [
  { id: 'aaaaaaaaaaaaaaaaaaaaaaaa', name: 'Classic Serif', fallback: 'serif' as const, files: [] },
  { id: 'bbbbbbbbbbbbbbbbbbbbbbbb', name: 'Typewriter Mono', fallback: 'mono' as const, files: [] },
];

export default function ExampleFontPickerBasic() {
  const [font, setFont] = useState<FontFamilyValue | undefined>('display');
  return (
    <Container flex={{ direction: 'column', gap: 12 }} maxWidth={360}>
      <ThemeFonts families={families} />
      <FontPicker label="Font" families={families} value={font} onValueChange={setFont} />
      <Text as="p" fontFamily={font} fontSize={20}>
        The quick brown fox jumps over the lazy dog
      </Text>
    </Container>
  );
}
