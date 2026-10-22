import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pathHasParams, type Page } from '@inithium/shared-contracts';
import { useGetCurrentUserQuery, useGetPagesQuery, useGetPageTemplatesQuery } from '@inithium/shared-data-access';
import { hasPermission } from '@inithium/shared-permissions';
import { Button, Container, Input, Loader, Select, Text, Tooltip } from '@inithium/shared-ui-components';
import { DeletePageDialog } from './delete-page-dialog.component';
import { NewPageDialog } from './new-page-dialog.component';
import { PageEditor } from './page-editor.component';
import { useLivePageEditing } from './use-live-page-editing.hook';

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
 * The CMS's Pages screen (decisions 0086, 0093): every page record with search and sorting, each row showing its path,
 * layout and status, a link to view it on the site and buttons to edit it, duplicate it (pages made from a reusable
 * template) and delete it (pages that aren't protected). "New page" creates one from a reusable template. Who's
 * editing each page in the page builder updates live (decision 0122).
 */
export function PagesScreen() {
  const { data: pages, isLoading, isError, refetch } = useGetPagesQuery();
  const { data: user } = useGetCurrentUserQuery();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('title');
  const [editing, setEditing] = useState<Page | null>(null);
  const navigate = useNavigate();
  const canPublish = user ? hasPermission(user.role, 'pages.publish') : false;
  const canCreate = user ? hasPermission(user.role, 'pages.create') : false;
  const canDelete = user ? hasPermission(user.role, 'pages.delete') : false;
  const templates = useGetPageTemplatesQuery(undefined, { skip: !canCreate });
  const reusable = new Set(templates.data?.map((template) => template.key));
  const [creating, setCreating] = useState(false);
  const [duplicating, setDuplicating] = useState<Page | null>(null);
  const [deleting, setDeleting] = useState<Page | null>(null);
  useLivePageEditing();
  const closeNewPage = () => {
    setCreating(false);
    setDuplicating(null);
  };

  const shown = useMemo(() => visiblePages(pages ?? [], search, sort), [pages, search, sort]);

  return (
    <Container flex={{ direction: 'column', gap: 24 }}>
      <Container flex={{ direction: { base: 'column', md: 'row' }, align: { base: 'start', md: 'end' }, justify: 'between', gap: 16 }}>
        <Container flex={{ direction: 'column', gap: 4 }}>
          <Text as="h1" fontFamily="display" fontSize={28}>
            Pages
          </Text>
          <Text as="p" fontSize={14} textColor={{ color: 'surface', intensity: 700 }}>
            The pages on your site: their titles, look, who can see them, menus and search details.
          </Text>
        </Container>
        {canCreate && (
          <Button leadingIcon="plus" onClick={() => setCreating(true)}>
            New page
          </Button>
        )}
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
                  {page.editing && (
                    <Text as="span" fontSize={13} textColor={{ color: 'amber', intensity: 700 }}>
                      {' '}· {page.editing.name} is editing it
                    </Text>
                  )}
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
              {page.content && (
                <Tooltip content="Edit content">
                  <Button
                    variant="ghost"
                    leadingIcon="layout-template"
                    aria-label={`Edit the content of ${page.title}`}
                    padding={{ x: 6 }}
                    onClick={() => navigate(`/pages/${page.id}/content`)}
                  />
                </Tooltip>
              )}
              <Tooltip content="Settings">
                <Button variant="ghost" leadingIcon="settings-2" aria-label={`Edit ${page.title}`} padding={{ x: 6 }} onClick={() => setEditing(page)} />
              </Tooltip>
              {canCreate && reusable.has(page.template) && (
                <Tooltip content="Duplicate">
                  <Button variant="ghost" leadingIcon="copy" aria-label={`Duplicate ${page.title}`} padding={{ x: 6 }} onClick={() => setDuplicating(page)} />
                </Tooltip>
              )}
              {canDelete && !page.protected && (
                <Tooltip content="Delete">
                  <Button
                    variant="ghost"
                    color="red"
                    leadingIcon="trash-2"
                    aria-label={`Delete ${page.title}`}
                    padding={{ x: 6 }}
                    onClick={() => setDeleting(page)}
                  />
                </Tooltip>
              )}
            </Container>
          ))}
        </Container>
      )}

      <PageEditor page={editing} onClose={() => setEditing(null)} canPublish={canPublish} />
      <NewPageDialog
        open={creating || duplicating !== null}
        source={duplicating}
        onClose={closeNewPage}
        onCreated={(page) => {
          closeNewPage();
          // Straight on to building it: content pages open in the block editor, others in their settings (decision 0093).
          if (page.content) navigate(`/pages/${page.id}/content`);
          else setEditing(page);
        }}
      />
      <DeletePageDialog page={deleting} onClose={() => setDeleting(null)} />
    </Container>
  );
}
