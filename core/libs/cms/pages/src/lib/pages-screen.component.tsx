import { useMemo, useState } from 'react';
import { pathHasParams, type Page } from '@inithium/shared-contracts';
import { useGetCurrentUserQuery, useGetPagesQuery } from '@inithium/shared-data-access';
import { hasPermission } from '@inithium/shared-permissions';
import { Button, Container, Input, Loader, Select, Text, Tooltip } from '@inithium/shared-ui-components';
import { PageEditor } from './page-editor.component';

type SortKey = 'title' | 'path' | 'status';
const SORTS: { value: SortKey; label: string }[] = [
  { value: 'title', label: 'Title' },
  { value: 'path', label: 'Path' },
  { value: 'status', label: 'Status' },
];

/** Pages whose title or path contain every word of the search, in the chosen order. */
function visiblePages(pages: Page[], search: string, sort: SortKey) {
  const words = search.toLowerCase().split(/\s+/).filter(Boolean);
  return pages
    .filter((page) => words.every((word) => `${page.title} ${page.path}`.toLowerCase().includes(word)))
    .sort((a, b) => a[sort].localeCompare(b[sort]) || a.title.localeCompare(b.title));
}

/**
 * The CMS's Pages screen (decision 0086): every page record with search and sorting, each row showing its path,
 * layout and status, a link to view it on the site and a button opening the page editor.
 */
export function PagesScreen() {
  const { data: pages, isLoading, isError, refetch } = useGetPagesQuery();
  const { data: user } = useGetCurrentUserQuery();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('title');
  const [editing, setEditing] = useState<Page | null>(null);
  const canPublish = user ? hasPermission(user.role, 'pages.publish') : false;

  const shown = useMemo(() => visiblePages(pages ?? [], search, sort), [pages, search, sort]);

  return (
    <Container flex={{ direction: 'column', gap: 24 }}>
      <Container flex={{ direction: 'column', gap: 4 }}>
        <Text as="h1" fontFamily="display" fontSize={28}>
          Pages
        </Text>
        <Text as="p" fontSize={14} textColor={{ color: 'surface', intensity: 700 }}>
          The pages on your site: their titles, look, who can see them, menus and search details.
        </Text>
      </Container>

      <Container grid={{ columns: { base: 1, md: 2 }, gap: 12 }}>
        <Input label="Search pages" leadingIcon="search" value={search} onValueChange={setSearch} />
        <Select label="Sort by" value={sort} onValueChange={(value) => setSort(value as SortKey)} options={SORTS} />
      </Container>

      {isLoading ? (
        <Container flex={{ justify: 'center' }} padding={{ all: 32 }}>
          <Loader size={32} label="Loading pages" />
        </Container>
      ) : isError ? (
        <Container flex={{ direction: 'column', align: 'start', gap: 12 }}>
          <Text as="p">We couldn’t load the pages.</Text>
          <Button variant="outlined" onClick={() => void refetch()}>
            Try again
          </Button>
        </Container>
      ) : shown.length === 0 ? (
        <Text as="p" textColor={{ color: 'surface', intensity: 700 }}>
          No pages match “{search}”.
        </Text>
      ) : (
        <Container as="ul" flex={{ direction: 'column', gap: 8 }} aria-label="Pages">
          {shown.map((page) => (
            <Container
              as="li"
              key={page.id}
              flex={{ align: 'center', gap: 16 }}
              padding={{ x: 20, y: 16 }}
              radius={{ all: 8 }}
              bgColor={{ color: 'surface', intensity: 50 }}
              borderWidth={{ all: 1 }}
              borderColor={{ color: 'surface', intensity: 500, opacity: 30 }}
            >
              <Container flex={{ direction: 'column', gap: 4 }} flexItem={{ grow: 1 }} minWidth={0}>
                <Container flex={{ align: 'center', gap: 8 }}>
                  <Text as="span" fontSize={16} fontWeight={600}>
                    {page.title}
                  </Text>
                  {page.protected && (
                    <Text
                      as="span"
                      fontSize={11}
                      fontWeight={600}
                      padding={{ x: 8, y: 2 }}
                      radius={{ all: 999 }}
                      bgColor={{ color: 'surface', intensity: 200 }}
                      textColor={{ color: 'surface', intensity: 800 }}
                    >
                      Site page
                    </Text>
                  )}
                </Container>
                <Text as="span" fontSize={13} textColor={{ color: 'surface', intensity: 700 }}>
                  {page.path} · {page.layout} ·{' '}
                  <Text as="span" fontSize={13} textColor={page.status === 'published' ? { color: 'green', intensity: 700 } : { color: 'surface', intensity: 600 }}>
                    {page.status === 'published' ? 'Published' : 'Unpublished'}
                  </Text>
                </Text>
              </Container>
              {pathHasParams(page.path) || page.status !== 'published' ? (
                <Tooltip content={page.status !== 'published' ? 'Unpublished pages aren’t on the site.' : 'This page needs details in its address, e.g. a profile’s id.'}>
                  <Button variant="ghost" leadingIcon="external-link" aria-label={`View ${page.title}`} padding={{ x: 6 }} disabled />
                </Tooltip>
              ) : (
                <Tooltip content="View on the site">
                  <Button
                    variant="ghost"
                    leadingIcon="external-link"
                    aria-label={`View ${page.title} on the site`}
                    padding={{ x: 6 }}
                    onClick={() => window.open(page.path, '_blank', 'noopener')}
                  />
                </Tooltip>
              )}
              <Tooltip content="Edit">
                <Button variant="ghost" leadingIcon="pencil" aria-label={`Edit ${page.title}`} padding={{ x: 6 }} onClick={() => setEditing(page)} />
              </Tooltip>
            </Container>
          ))}
        </Container>
      )}

      <PageEditor page={editing} onClose={() => setEditing(null)} canPublish={canPublish} />
    </Container>
  );
}
