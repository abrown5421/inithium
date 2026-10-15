import type { ContainerElement, ContentDocument, RichTextDocument } from '@inithium/shared-contracts';
import { ContentRenderer } from '@inithium/shared-content';
import { Container } from '@inithium/shared-ui-components';

const heading = (level: 1 | 2 | 3, text: string): RichTextDocument => ({
  type: 'doc',
  content: [{ type: 'heading', attrs: { level }, content: [{ type: 'text', text }] }],
});
const paragraph = (text: string): RichTextDocument => ({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text }] }] });

/** One card: a bordered Container holding an icon, a heading, a line of text and a button. Duplicated for the row. */
const card = (id: string, icon: string, title: string, text: string): ContainerElement => ({
  id,
  type: 'container',
  label: 'Card',
  props: {
    flex: { direction: 'column', gap: 12 },
    flexItem: { grow: 1, basis: 0 },
    padding: { all: 24 },
    radius: { all: 12 },
    borderWidth: { all: 1 },
    borderColor: { color: 'surface', intensity: 500, opacity: 40 },
    bgColor: { color: 'surface', intensity: 50 },
    shadow: 'md',
  },
  children: [
    { id: `${id}-icon`, type: 'icon', props: { name: icon, size: 28, textColor: { color: 'primary', intensity: 500 } } },
    { id: `${id}-title`, type: 'text', props: { doc: heading(3, title) } },
    { id: `${id}-text`, type: 'text', props: { doc: paragraph(text), textColor: { color: 'surface', intensity: 700 } } },
    { id: `${id}-divider`, type: 'divider', props: {} },
    { id: `${id}-button`, type: 'button', props: { label: 'Find out more', variant: 'outlined', link: { type: 'url', href: 'https://example.com' } } },
  ],
});

const content: ContentDocument = {
  schemaVersion: 2,
  elements: [
    {
      id: 'hero',
      type: 'container',
      label: 'Hero',
      props: {
        as: 'section',
        padding: { y: 56, x: 24 },
        bgColor: { color: 'primary', intensity: 700 },
        textColor: { color: 'surface', intensity: 50 },
        flex: { direction: 'column', align: 'center', gap: 16 },
      },
      children: [
        { id: 'hero-title', type: 'text', props: { doc: heading(1, 'Classes for every level'), align: 'center' } },
        { id: 'hero-text', type: 'text', props: { doc: paragraph('Small groups, friendly coaches.'), align: 'center' } },
        {
          id: 'hero-button',
          type: 'button',
          props: { label: 'Book a class', color: { color: 'secondary', intensity: 500 }, link: { type: 'page', pageId: 'not-on-this-site' } },
        },
      ],
    },
    {
      id: 'cards',
      type: 'container',
      label: 'Row of cards',
      props: {
        as: 'section',
        padding: { y: 48, x: 24 },
        flex: { direction: { base: 'column', md: 'row' }, gap: 24 },
      },
      children: [
        card('card-1', 'calendar', 'Book online', 'Pick a time that suits you.'),
        card('card-2', 'users', 'Small groups', 'Never more than eight.'),
        card('card-3', 'heart', 'All welcome', 'Beginners especially.'),
      ],
    },
  ],
};

export default function ExampleContentPageSample() {
  return (
    <Container borderWidth={{ all: 1 }} borderColor={{ color: 'surface', intensity: 500, opacity: 30 }}>
      <ContentRenderer content={content} links={{ pagePath: () => undefined, onNavigate: () => undefined }} />
    </Container>
  );
}
