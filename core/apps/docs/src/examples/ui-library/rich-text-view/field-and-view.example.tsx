import { useState } from 'react';
import { richTextFromPlainText, type RichTextDocument } from '@inithium/shared-contracts';
import { Container, Text } from '@inithium/shared-ui-components';
import { RichTextField, RichTextView } from '@inithium/shared-ui-composites';

export default function ExampleRichTextViewFieldAndView() {
  const [doc, setDoc] = useState<RichTextDocument>(richTextFromPlainText('Type here, and see it drawn beside the field.'));
  return (
    <Container grid={{ columns: { base: 1, md: 2 }, gap: 16 }}>
      <RichTextField label="Edit" value={doc} onChange={setDoc} minHeight={100} />
      <Container flex={{ direction: 'column', gap: 6 }}>
        <Text as="span" fontSize={13} fontWeight={500}>
          View
        </Text>
        <RichTextView doc={doc} align="start" />
      </Container>
    </Container>
  );
}
