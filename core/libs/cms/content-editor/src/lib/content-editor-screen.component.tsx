import type { ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Page } from '@inithium/shared-contracts';
import { useGetCurrentUserQuery, useGetPageQuery, useGetPagesQuery } from '@inithium/shared-data-access';
import { hasPermission } from '@inithium/shared-permissions';
import { Button, Container, Loader, Text } from '@inithium/shared-ui-components';
import { PageBuilder } from './page-builder.component';
import { useContentLock } from './use-content-lock.hook';

/** A full-screen message with a way back to Pages, and another action if there is one. */
function Notice({ title, message, action }: { title: string; message: string; action?: ReactNode }) {
  const navigate = useNavigate();
  return (
    <Container flexItem={{ grow: 1 }} flex={{ direction: 'column', align: 'center', justify: 'center', gap: 12 }} padding={{ all: 24 }}>
      <Text as="h1" fontFamily="display" fontSize={24}>
        {title}
      </Text>
      <Text as="p" align="center">
        {message}
      </Text>
      <Container flex={{ direction: 'row', gap: 8 }}>
        <Button variant="outlined" leadingIcon="arrow-left" onClick={() => navigate('/pages')}>
          Back to Pages
        </Button>
        {action}
      </Container>
    </Container>
  );
}

/** A time today as people read it, e.g. 10:42; another day's with its date. */
function sinceLabel(iso: string): string {
  const at = new Date(iso);
  const today = at.toDateString() === new Date().toDateString();
  return at.toLocaleString(undefined, today ? { hour: 'numeric', minute: '2-digit' } : { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
}

type BuilderPage = Page & { content: NonNullable<Page['content']> };

/**
 * The page builder, holding the page's edit lock (decision 0116): it opens once the lock is taken, and someone else
 * holding it gets a notice saying who and since when instead.
 */
function LockedBuilder({ page, pages, canPublish }: { page: BuilderPage; pages: Page[]; canPublish: boolean }) {
  const lock = useContentLock(page.id);
  const { state } = lock;
  const tryAgain = (
    <Button leadingIcon="refresh-cw" onClick={() => void lock.check()}>
      Try again
    </Button>
  );
  if (state.status === 'taking') {
    return (
      <Container flexItem={{ grow: 1 }} flex={{ align: 'center', justify: 'center' }}>
        <Loader size={40} label="Opening the page" />
      </Container>
    );
  }
  if (state.status === 'blocked') {
    const who = state.editing?.name ?? 'Someone';
    return (
      <Notice
        title={`${who} is editing this page`}
        message={`${state.editing ? `They opened it at ${sinceLabel(state.editing.since)}. ` : ''}Only one person can build a page at a time. You can open it once they’ve finished, or two minutes after they stop working on it.`}
        action={tryAgain}
      />
    );
  }
  if (state.status === 'failed') return <Notice title="We couldn’t open the page" message="Check your connection and try again." action={tryAgain} />;
  return <PageBuilder page={page} pages={pages} canPublish={canPublish} lockId={lock.lockId} lock={state} onLockCheck={() => void lock.check()} />;
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

  return <LockedBuilder key={page.data.id} page={{ ...page.data, content }} pages={pages.data ?? []} canPublish={hasPermission(user.role, 'pages.publish')} />;
}
