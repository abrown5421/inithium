import { Box, type TabItem } from '@inithium/ui';
import { ProfileEditForm } from './profile-edit-form';

export interface ProfileTabDefinition {
  key: string;
  label: string;
  order: number;
  requiresOwnProfile?: boolean;
  component: (props: { userId: string }) => React.ReactNode;
}

export const PROFILE_TABS_REGISTRY: ProfileTabDefinition[] = [
  {
    key: 'Home',
    label: 'Home',
    order: 1,
    component: () => (
      <Box justify='center' align='center' className='w-full h-full'>
        Profile Specific Info Here
      </Box>
    ),
  },
  {
    key: 'edit-profile',
    label: 'Edit Profile',
    order: 3,
    requiresOwnProfile: true,
    component: ({ userId }) => <ProfileEditForm userId={userId} />,
  },
];

export const buildProfileTabs = (
  registry: ProfileTabDefinition[],
  isOwnProfile: boolean,
  userId: string
): TabItem[] =>
  registry
    .filter((t) => !t.requiresOwnProfile || isOwnProfile)
    .sort((a, b) => a.order - b.order)
    .map((t) => ({
      label: t.label,
      panel: t.component({ userId }),
    }));