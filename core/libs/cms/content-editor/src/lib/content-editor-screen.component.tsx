import { useNavigate, useParams } from 'react-router-dom';
import { useGetCurrentUserQuery, useGetPageQuery, useGetPagesQuery } from '@inithium/shared-data-access';
import { hasPermission } from '@inithium/shared-permissions';
import { Button, Container, Loader, Text } from '@inithium/shared-ui-components';
import { PageBuilder } from './page-builder.component';

/** A full-screen message with a way back to Pages. */
function Notice({ title, message }: { title: string; message: string }) {
  const navigate = useNavigate();
  return (
    <Container flexItem={{ grow: 1 }} flex={{ direction: 'column', align: 'center', justify: 'center', gap: 12 }} padding={{ all: 24 }}>
      <Text as="h1" fontFamily="display" fontSize={24}>
        {title}
      </Text>
      <Text as="p" align="center">
        {message}
      </Text>
      <Button variant="outlined" leadingIcon="arrow-left" onClick={() => navigate('/pages')}>
        Back to Pages
      </Button>
    </Container>
  );
}

/**
 * The CMS screen for building a content page, `/pages/:id/content` (decision 0116): the page builder, filling the
 * space under the CMS's top bar, with no sidebar (a `fill` screen). Needs pages.edit; publishing needs pages.publish.
 */
export function ContentEditorScreen() {
  const { id = '' } = useParams();
  const { data: user } = useGetCurrentUserQuery();
  const canEdit = user ? hasPermission(user.role, 'pages.edit') : false;
  const page = useGetPageQuery(id, { skip: !canEdit });
  const pages = useGetPagesQuery(undefined, { skip: !canEdit });

  if (user && !canEdit) return <Notice title="You can’t edit pages" message="Ask an admin or the owner for access." />;
  if (page.isLoading || pages.isLoading || !user) {
    return (
      <Container flexItem={{ grow: 1 }} flex={{ align: 'center', justify: 'center' }}>
        <Loader size={40} label="Loading the page" />
      </Container>
    );
  }
  if (!page.data) return <Notice title="Page not found" message="It may have been deleted." />;
  const { content } = page.data;
  if (!content) return <Notice title="This page isn’t built here" message="It’s drawn by its own code. Change its settings from the Pages list instead." />;

  return <PageBuilder key={page.data.id} page={{ ...page.data, content }} pages={pages.data ?? []} canPublish={hasPermission(user.role, 'pages.publish')} />;
}
