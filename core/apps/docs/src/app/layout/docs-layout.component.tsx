import { Navigate, useLocation } from 'react-router-dom';
import { Container, Text } from '@inithium/shared-ui-components';
import { findPage, readingOrder } from '../manual/manual.service';
import { ManualPageView } from '../page/manual-page.component';
import { SearchBox } from './search-box.component';
import { SidebarNav } from './sidebar-nav.component';

/** Header, sidebar and the current page. The URL path is the page's path inside docs/. */
export function DocsLayout() {
  const { pathname } = useLocation();
  const slug = decodeURIComponent(pathname).replace(/^\/+|\/+$/g, '');
  const page = findPage(slug);

  if (!slug && readingOrder[0]) return <Navigate to={`/${readingOrder[0].slug}`} replace />;

  return (
    <Container minHeight="screen" bgColor={{ color: 'surface', intensity: 100 }} textColor={{ color: 'surface', intensity: 900 }}>
      <Container
        as="header"
        position={{ type: 'sticky', top: 0, z: 20 }}
        flex={{ align: 'center', justify: 'between', gap: 16, wrap: 'wrap' }}
        padding={{ x: 20, y: 12 }}
        bgColor={{ color: 'surface', intensity: 50 }}
        borderWidth={{ bottom: 1 }}
        borderColor={{ color: 'surface', intensity: 500, opacity: 40 }}
      >
        <Container flex={{ align: 'baseline', gap: 10 }}>
          <Text as="span" fontFamily="display" fontSize={22} textColor="primary">
            Inithium
          </Text>
          <Text as="span" fontSize={13} textColor={{ color: 'surface', intensity: 600 }}>
            developer manual
          </Text>
        </Container>
        <SearchBox />
      </Container>

      <Container flex={{ direction: { base: 'column', md: 'row' } }}>
        <Container
          as="aside"
          width={{ base: 'full', md: 280 }}
          flexItem={{ shrink: 0 }}
          padding={{ x: 12, y: 20 }}
          position={{ type: { base: 'static', md: 'sticky' }, top: 61 }}
          maxHeight={{ base: 'auto', md: 'screen' }}
          overflow={{ y: 'auto' }}
          borderWidth={{ base: { bottom: 1 }, md: { right: 1 } }}
          borderColor={{ color: 'surface', intensity: 500, opacity: 40 }}
          bgColor={{ color: 'surface', intensity: 50 }}
        >
          <SidebarNav />
        </Container>

        <Container as="main" flexItem={{ grow: 1 }} minWidth={0} padding={{ base: { x: 16, y: 24 }, md: { x: 48, y: 40 } }}>
          <Container maxWidth={920}>
            {page ? (
              <ManualPageView page={page} />
            ) : (
              <Container flex={{ direction: 'column', gap: 8 }}>
                <Text as="h1" fontSize={28} fontWeight={700}>
                  Page not found
                </Text>
                <Text>No manual page lives at /{slug}. Pick one from the sidebar or search.</Text>
              </Container>
            )}
          </Container>
        </Container>
      </Container>
    </Container>
  );
}
