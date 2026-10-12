import { useSearchParams } from 'react-router-dom';
import { Button, Container, Text } from '@inithium/shared-ui-components';
import type { ProfileSlotProps } from './profile-slots.types';

/** Core's About tab, for everyone (decision 0090): the profile's bio, or a prompt for its owner to add one. */
export function ProfileAboutTab({ profile, viewer }: ProfileSlotProps) {
  const [, setSearchParams] = useSearchParams();
  if (profile.bio) {
    return (
      <Text as="p" lineHeight={1.6}>
        {profile.bio}
      </Text>
    );
  }
  if (viewer !== 'owner') {
    return (
      <Text as="p" textColor={{ color: 'surface', intensity: 700 }}>
        Nothing here yet.
      </Text>
    );
  }
  return (
    <Container flex={{ direction: 'column', align: 'start', gap: 12 }}>
      <Text as="p" textColor={{ color: 'surface', intensity: 700 }}>
        You haven't written a bio yet. A line or two helps people know who you are.
      </Text>
      <Button variant="outlined" leadingIcon="pencil" onClick={() => setSearchParams({ tab: 'account' }, { replace: true })}>
        Add a bio
      </Button>
    </Container>
  );
}
