import { richTextFromPlainText } from '@inithium/shared-contracts';
import { Container } from '@inithium/shared-ui-components';
import { RichTextField } from '@inithium/shared-ui-composites';

export default function ExampleRichTextFieldStates() {
  return (
    <Container grid={{ columns: { base: 1, md: 2 }, gap: 16 }}>
      <RichTextField label="Required, with an error" required features={['bold', 'italic']} minHeight={60} error="Write a summary" />
      <RichTextField label="Disabled" disabled features={['bold']} minHeight={60} defaultValue={richTextFromPlainText('This can’t be edited.')} />
      <RichTextField label="Secondary colour" color="secondary" features={['bold', 'italic', 'bulletList']} minHeight={60} />
    </Container>
  );
}
