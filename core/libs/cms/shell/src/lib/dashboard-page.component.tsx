import { userDisplayName } from '@inithium/shared-contracts';
import { useGetCurrentUserQuery } from '@inithium/shared-data-access';
import { Container, Text } from '@inithium/shared-ui-components';

/** The CMS's landing screen (decision 0086). Empty for now; it will show different things to different roles. */
export function DashboardPage() {
  const { data: user } = useGetCurrentUserQuery();
  return (
    <Container flex={{ direction: 'column', gap: 4 }}>
      <Text as="h1" fontFamily="display" fontSize={28}>
        Dashboard
      </Text>
      {user && (
        <Text as="p" fontSize={14} textColor={{ color: 'surface', intensity: 700 }}>
          Welcome, {userDisplayName(user)}.
        </Text>
      )}
    </Container>
  );
}
