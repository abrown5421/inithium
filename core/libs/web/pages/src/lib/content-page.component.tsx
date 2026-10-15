import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { pathHasParams, readContentDocument } from '@inithium/shared-contracts';
import { ContentRenderer, type ContentLinks } from '@inithium/shared-content';
import { Container, Text } from '@inithium/shared-ui-components';
import { useSite, type PageTemplateProps } from '@inithium/web-shell';

/**
 * Core's reusable Content page template (decisions 0093, 0116): draws the page's published elements, upgrading
 * content stored in an older format. Links to other pages resolve by id against the site's published pages; pages
 * with parameters in their path can't be linked to.
 */
export function ContentPage({ page }: PageTemplateProps) {
  const { pages } = useSite();
  const navigate = useNavigate();
  const links = useMemo<ContentLinks>(() => {
    const paths = new Map(pages.filter((entry) => !pathHasParams(entry.path)).map((entry) => [entry.id, entry.path]));
    return { pagePath: (pageId) => paths.get(pageId), onNavigate: (path) => navigate(path) };
  }, [pages, navigate]);
  const content = useMemo(() => readContentDocument(page.content), [page.content]);

  if (!content || content.elements.length === 0) {
    return (
      <Container padding={{ x: 24, y: 48 }}>
        <Text as="h1" fontFamily="display" fontSize={32}>
          {page.title}
        </Text>
      </Container>
    );
  }
  return <ContentRenderer content={content} links={links} />;
}
