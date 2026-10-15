import type { ContentDocument } from '@inithium/shared-contracts';
import { Container } from '@inithium/shared-ui-components';
import { ContentDecoratorsProvider, type ContentDecorators } from './content-decorators.context';
import { ContentElementView } from './content-element.component';
import { ContentLinksProvider, type ContentLinks } from './content-links.context';

export type ContentRendererProps = {
  /** The content to draw: a content page's published version (or, in the CMS, its draft). */
  content: ContentDocument;
  /** Resolves links to the site's pages and follows them through the app's router. */
  links: ContentLinks;
  /** Wraps or replaces elements as they're drawn: for the CMS editor's preview only. */
  decorators?: ContentDecorators;
};

/**
 * Draws a content page's elements (decision 0116) with the UI library's components, stacked down the page in order.
 * `web`'s content template uses it, and so will the CMS editor's preview, so a preview always matches the site.
 */
export function ContentRenderer({ content, links, decorators = NO_DECORATORS }: ContentRendererProps) {
  return (
    <ContentLinksProvider links={links}>
      <ContentDecoratorsProvider value={decorators}>
        <Container flex={{ direction: 'column' }} width="full">
          {content.elements.map((element) => (
            <ContentElementView key={element.id} element={element} />
          ))}
        </Container>
      </ContentDecoratorsProvider>
    </ContentLinksProvider>
  );
}

const NO_DECORATORS: ContentDecorators = {};
