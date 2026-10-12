import type { ContentDocument } from '@inithium/shared-contracts';
import { ContentRenderer } from '@inithium/shared-content';
import { Container } from '@inithium/shared-ui-components';

const content: ContentDocument = {
  schemaVersion: 1,
  sections: [
    {
      id: 'hero',
      layout: 'one',
      padding: { y: 24 },
      columns: [
        {
          id: 'hero-1',
          blocks: [
            {
              id: 'banner',
              type: 'banner',
              height: 220,
              heading: 'Classes for every level',
              text: 'Small groups, friendly coaches.',
              pattern: {
                cellSize: 90,
                variance: 0.7,
                xColors: [
                  { color: 'primary', intensity: 700 },
                  { color: 'secondary', intensity: 500 },
                ],
                yColors: [
                  { color: 'tertiary', intensity: 600 },
                  { color: 'primary', intensity: 800 },
                ],
                seed: 'sample',
              },
            },
          ],
        },
      ],
    },
    {
      id: 'features',
      layout: 'thirds',
      bgColor: { color: 'surface', intensity: 100 },
      columns: [
        { id: 'f1', blocks: [{ id: 'f1b', type: 'feature', icon: 'calendar', title: 'Book online', text: 'Pick a time that suits you.', align: 'center' }] },
        { id: 'f2', blocks: [{ id: 'f2b', type: 'feature', icon: 'users', title: 'Small groups', text: 'Never more than eight.', align: 'center' }] },
        { id: 'f3', blocks: [{ id: 'f3b', type: 'feature', icon: 'heart', title: 'All welcome', text: 'Beginners especially.', align: 'center' }] },
      ],
    },
    {
      id: 'about',
      layout: 'two-thirds-one-third',
      columns: [
        {
          id: 'about-text',
          blocks: [
            { id: 'h', type: 'heading', level: 2, text: 'About us' },
            {
              id: 'rt',
              type: 'rich-text',
              doc: {
                type: 'doc',
                content: [
                  {
                    type: 'paragraph',
                    content: [
                      { type: 'text', text: 'We teach ' },
                      { type: 'text', text: 'everything', marks: [{ type: 'bold' }] },
                      { type: 'text', text: ' from the basics to ' },
                      { type: 'text', text: 'competition level', marks: [{ type: 'italic' }] },
                      { type: 'text', text: '. Read the ' },
                      {
                        type: 'text',
                        text: 'timetable',
                        marks: [{ type: 'link', attrs: { link: { type: 'url', href: 'https://example.com', newTab: true } } }],
                      },
                      { type: 'text', text: '.' },
                    ],
                  },
                  { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'What to bring' }] },
                  {
                    type: 'bulletList',
                    content: [
                      { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Comfortable clothes' }] }] },
                      { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'A water bottle' }] }] },
                    ],
                  },
                  { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'The best class I have ever taken.' }] }] },
                ],
              },
            },
          ],
        },
        {
          id: 'about-cta',
          blocks: [
            { id: 'h2', type: 'heading', level: 3, text: 'Ready to start?' },
            {
              id: 'b',
              type: 'buttons',
              buttons: [
                { id: 'b1', label: 'Get in touch', icon: 'mail', link: { type: 'url', href: 'mailto:hello@example.com' } },
                { id: 'b2', label: 'Prices', variant: 'outlined', link: { type: 'page', pageId: 'not-on-this-site' } },
              ],
            },
          ],
        },
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
