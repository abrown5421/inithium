import type { RichTextDocument } from '@inithium/shared-contracts';
import { RichTextView } from '@inithium/shared-ui-composites';

const doc: RichTextDocument = {
  type: 'doc',
  content: [
    { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Saved as JSON, drawn safely' }] },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Text can be ' },
        { type: 'text', text: 'bold', marks: [{ type: 'bold' }] },
        { type: 'text', text: ', ' },
        { type: 'text', text: 'italic', marks: [{ type: 'italic' }] },
        { type: 'text', text: ' or ' },
        { type: 'text', text: 'a link', marks: [{ type: 'link', attrs: { link: { type: 'url', href: 'https://example.com', newTab: true } } }] },
        { type: 'text', text: '.' },
      ],
    },
    {
      type: 'bulletList',
      content: [
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Lists draw their own markers' }] }] },
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'and can nest' }] }] },
      ],
    },
    { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Quotes get a bar in the primary colour.' }] }] },
  ],
};

export default function ExampleRichTextViewBasic() {
  return <RichTextView doc={doc} />;
}
