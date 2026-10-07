import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useGetCurrentUserQuery, useLogoutMutation } from '@inithium/shared-data-access';
import { hasPermission } from '@inithium/shared-permissions';

function CenteredMessage({ children }: { children: ReactNode }) {
  return <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">{children}</main>;
}

/** Renders its children only for a signed-in user with CMS access; otherwise sends them to /login. */
export function CmsAccessGuard({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { data: user, error, isFetching, refetch } = useGetCurrentUserQuery();
  const [logout] = useLogoutMutation();

  if (!user && isFetching) {
    return <CenteredMessage>Loading…</CenteredMessage>;
  }

  if (error && 'status' in error && error.status !== 401) {
    return (
      <CenteredMessage>
        <p>Couldn't reach the server.</p>
        <button type="button" onClick={() => refetch()} className="rounded border px-3 py-1">
          Try again
        </button>
      </CenteredMessage>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!hasPermission(user.role, 'cms.access')) {
    return (
      <CenteredMessage>
        <p>Your account doesn't have access to the CMS.</p>
        <button type="button" onClick={() => logout()} className="rounded border px-3 py-1">
          Sign out
        </button>
      </CenteredMessage>
    );
  }

  return children;
}
