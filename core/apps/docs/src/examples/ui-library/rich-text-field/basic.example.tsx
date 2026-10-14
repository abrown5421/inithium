import { useState } from 'react';
import { richTextLength, type RichTextDocument } from '@inithium/shared-contracts';
import { Container, Text } from '@inithium/shared-ui-components';
import { RichTextField } from '@inithium/shared-ui-composites';

export default function ExampleRichTextFieldBasic() {
  const [doc, setDoc] = useState<RichTextDocument | undefined>();
  return (
    <Container flex={{ direction: 'column', gap: 12 }}>
      <RichTextField label="Description" value={doc} onChange={setDoc} placeholder="Describe it: headings, lists, quotes and links all work" />
      <Text as="p" fontSize={12} textColor={{ color: 'surface', intensity: 700 }}>
        {doc ? `${richTextLength(doc)} characters, saved as ${doc.content.length} block(s) of JSON.` : 'Nothing typed yet.'}
      </Text>
    </Container>
  );
}
