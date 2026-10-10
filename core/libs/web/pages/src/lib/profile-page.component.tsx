import { Container, Text } from '@inithium/shared-ui-components';
import { useSite, type PageTemplateProps } from '@inithium/web-shell';

/** Who's looking at a profile (decision 0081). */
export type ProfileViewer = 'visitor' | 'member' | 'owner';

const DESCRIPTIONS: Record<ProfileViewer, string> = {
  visitor: "You're viewing this profile signed out.",
  member: "You're viewing someone else's profile.",
  owner: 'This is your profile.',
};

/** Core's placeholder Profile page: shows which viewer it sees until profiles are built (decision 0081). */
export function ProfilePage({ page, params }: PageTemplateProps) {
  const { user } = useSite();
  const viewer: ProfileViewer = !user ? 'visitor' : user.id === params['id'] ? 'owner' : 'member';
  return (
    <Container flex={{ direction: 'column', gap: 12 }}>
      <Text as="h1" fontFamily="display" fontSize={32}>
        {page.title}
      </Text>
      <Text as="p">{DESCRIPTIONS[viewer]}</Text>
      <Text as="p" fontSize={14} textColor={{ color: 'surface', intensity: 700 }}>
        Profile id: {params['id']}
      </Text>
    </Container>
  );
}
