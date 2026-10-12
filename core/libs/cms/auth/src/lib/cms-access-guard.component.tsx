import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useGetCurrentUserQuery, useLogoutMutation } from '@inithium/shared-data-access';
import { PasswordChangeScreen } from '@inithium/shared-auth-ui';
import { hasPermission } from '@inithium/shared-permissions';
import { Button, Container, Loader, Text } from '@inithium/shared-ui-components';

function CenteredMessage({ children }: { children: ReactNode }) {
  return (
    <Container minHeight="screen" flex={{ direction: 'column', align: 'center', justify: 'center', gap: 16 }} padding={{ all: 24 }}>
      {children}
    </Container>
  );
}

/**
 * Renders its children only for a signed-in user with CMS access; otherwise sends them to /login. An account that
 * must change its password sees that screen first.
 */
export function CmsAccessGuard({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { data: user, error, isFetching, refetch } = useGetCurrentUserQuery();
  const [logout] = useLogoutMutation();

  if (!user && isFetching) {
    return (
      <CenteredMessage>
        <Loader size={40} label="Loading the CMS" />
      </CenteredMessage>
    );
  }

  if (error && 'status' in error && error.status !== 401) {
    return (
      <CenteredMessage>
        <Text as="p">Couldn't reach the server.</Text>
        <Button variant="outlined" onClick={() => void refetch()}>
          Try again
        </Button>
      </CenteredMessage>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!hasPermission(user.role, 'cms.access')) {
    return (
      <CenteredMessage>
        <Text as="p">Your account doesn't have access to the CMS.</Text>
        <Button variant="outlined" onClick={() => void logout()}>
          Sign out
        </Button>
      </CenteredMessage>
    );
  }

  // Accounts with a temporary password choose their own before anything else (decision 0088).
  if (user.passwordChangeRequired) return <PasswordChangeScreen />;

  return children;
}
