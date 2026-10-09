import { useEffect, useMemo } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Container, Icon, Text } from '@inithium/shared-ui-components';
import { Breadcrumbs } from '@inithium/shared-ui-composites';
import { readingOrder, sectionTrail, vscodeLink, type ManualPage } from '../manual/manual.service';
import { markdownComponents } from './markdown-elements.component';

const muted = { color: 'surface', intensity: 600 } as const;

function NeighbourLink({ page, direction }: { page: ManualPage; direction: 'previous' | 'next' }) {
  return (
    <Link to={`/${page.slug}`}>
      <Container
        flex={{ direction: 'column', gap: 2, align: direction === 'next' ? 'end' : 'start' }}
        padding={{ x: 16, y: 12 }}
        radius={{ all: 10 }}
        borderWidth={{ all: 1 }}
        borderColor={{ base: { color: 'surface', intensity: 500, opacity: 40 }, hover: { color: 'primary', intensity: 400 } }}
      >
        <Text as="span" fontSize={13} textColor={muted}>
          {direction === 'next' ? 'Next' : 'Previous'}
        </Text>
        <Container flex={{ align: 'center', gap: 6 }} textColor={{ color: 'primary', intensity: 700 }}>
          {direction === 'previous' && <Icon name="arrow-left" size={16} />}
          <Text as="span" fontWeight={600}>
            {page.title}
          </Text>
          {direction === 'next' && <Icon name="arrow-right" size={16} />}
        </Container>
      </Container>
    </Link>
  );
}

/** One manual page: breadcrumb, Markdown body, edit link and previous/next navigation. */
export function ManualPageView({ page }: { page: ManualPage }) {
  const { hash } = useLocation();
  const navigate = useNavigate();
  const components = useMemo(() => markdownComponents(page), [page]);
  const position = readingOrder.indexOf(page);
  const previous = readingOrder[position - 1];
  const next = readingOrder[position + 1];
  const trail = sectionTrail(page);

  // Jump to the heading in the URL, or to the top when the page changes.
  useEffect(() => {
    const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
    if (target) target.scrollIntoView();
    else window.scrollTo({ top: 0 });
  }, [page, hash]);

  return (
    <Container as="article" flex={{ direction: 'column' }}>
      <Container flex={{ align: 'center', justify: 'between', wrap: 'wrap', gap: 8 }} margin={{ bottom: 16 }}>
        <Breadcrumbs
          items={[...trail.map((section) => ({ label: section.title, href: `/${section.slug}` })), { label: page.title }]}
          onNavigate={(href) => navigate(href)}
        />
        <a href={vscodeLink(page.file)} title="Open this page in VS Code">
          <Container flex={{ align: 'center', gap: 6 }} textColor={{ base: muted, hover: { color: 'primary', intensity: 700 } }}>
            <Icon name="square-pen" size={14} />
            <Text as="span" fontSize={13}>
              Edit {page.file}
            </Text>
          </Container>
        </a>
      </Container>

      <Markdown remarkPlugins={[remarkGfm]} components={components}>
        {page.body}
      </Markdown>

      <Container
        as="nav"
        aria-label="Previous and next pages"
        grid={{ columns: { base: 1, sm: 2 }, gap: 12 }}
        margin={{ top: 48 }}
        padding={{ top: 24 }}
        borderWidth={{ top: 1 }}
        borderColor={{ color: 'surface', intensity: 500, opacity: 40 }}
      >
        <Container>{previous && <NeighbourLink page={previous} direction="previous" />}</Container>
        <Container>{next && <NeighbourLink page={next} direction="next" />}</Container>
      </Container>
    </Container>
  );
}
