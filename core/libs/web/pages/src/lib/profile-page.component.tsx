import { useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { publicProfileName, type AvatarRecipe, type PolyPattern, type ProfileViewer } from '@inithium/shared-contracts';
import { readApiFailure, useAlerts, useGetProfileQuery, useUpdateMyProfileMutation } from '@inithium/shared-data-access';
import { Container, Icon, Text } from '@inithium/shared-ui-components';
import { Alert, Tabs } from '@inithium/shared-ui-composites';
import { ProfileLayout } from '@inithium/shared-ui-layouts';
import { usePageReady, useSite, type PageTemplateProps } from '@inithium/web-shell';
import { NotFoundPage } from './not-found-page.component';
import { ProfileAccountTab } from './profile-account-tab.component';
import { PROFILE_CARD_GAP, profileCard } from './profile-card.config';
import { useProfileSlots } from './profile-slots.context';
import type { ProfileSidebarSection, ProfileSlotEntry, ProfileSlotProps, ProfileTab } from './profile-slots.types';

/** The profile's bio and details in its sidebar: the bio, when they joined, and their email for its owner. */
function ProfileAbout({ profile }: ProfileSlotProps) {
  const joined = new Date(profile.joinedAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const row = (icon: 'calendar' | 'mail', text: string) => (
    <Container flex={{ direction: 'row', align: 'center', gap: 8 }} textColor={{ color: 'surface', intensity: 800 }}>
      <Icon name={icon} size={18} />
      <Text as="span" fontSize={14} truncate={1}>
        {text}
      </Text>
    </Container>
  );
  return (
    <Container flex={{ direction: 'column', gap: 16 }}>
      {profile.bio && (
        <Text as="p" lineHeight={1.6}>
          {profile.bio}
        </Text>
      )}
      <Container as="ul" flex={{ direction: 'column', gap: 10 }}>
        <Container as="li">{row('calendar', `Joined ${joined}`)}</Container>
        {profile.email && <Container as="li">{row('mail', profile.email)}</Container>}
      </Container>
    </Container>
  );
}

// Core's own entries (decisions 0090, 0091); the registry's are merged in by order.
const CORE_TABS: ProfileTab[] = [
  { key: 'account', label: 'Account', icon: 'settings', order: 1000, viewers: ['owner'], component: ProfileAccountTab },
];
const CORE_SIDEBAR: ProfileSidebarSection[] = [
  { key: 'about', label: 'About', order: 0, viewers: ['visitor', 'member', 'owner'], component: ProfileAbout },
];

/** The entries this viewer sees, in order. */
const visible = <Entry extends ProfileSlotEntry>(entries: Entry[], viewer: ProfileViewer): Entry[] =>
  entries.filter((entry) => entry.viewers.includes(viewer)).sort((a, b) => a.order - b.order);

/**
 * Core's Profile page (decisions 0081, 0090, 0091): the profile's banner, avatar, name and bio in ProfileLayout's
 * sidebar, with its tabs in the main column, each for the viewers it names. Plugins add tabs, sidebar sections and
 * header actions through the web registry. Its owner edits the avatar and banner in place, and everything else in
 * the Account tab's form.
 */
export function ProfilePage({ params }: PageTemplateProps) {
  const id = params['id'] ?? '';
  const { user, pages } = useSite();
  const query = useGetProfileQuery(id);
  usePageReady(!query.isLoading);
  const slots = useProfileSlots();
  const [searchParams, setSearchParams] = useSearchParams();
  const [updateProfile] = useUpdateMyProfileMutation();
  const { show: showAlert, dismiss: dismissAlert } = useAlerts();
  const lastAlert = useRef<string | null>(null);

  const viewer: ProfileViewer = !user ? 'visitor' : user.id === id ? 'owner' : 'member';
  const tabs = useMemo(() => visible([...CORE_TABS, ...slots.tabs], viewer), [slots.tabs, viewer]);
  const sidebar = useMemo(() => visible([...CORE_SIDEBAR, ...slots.sidebarSections], viewer), [slots.sidebarSections, viewer]);
  const actions = useMemo(() => visible(slots.headerActions, viewer), [slots.headerActions, viewer]);

  const profile = query.data;
  if (!profile) {
    if (query.isLoading) return null;
    // An unknown profile shows the Not Found page in place, keeping the address.
    const notFound = pages.find((page) => page.template === 'not-found');
    return (
      <Container width="full" padding={{ x: 24, y: 32 }}>
        {notFound ? (
          <NotFoundPage page={notFound} params={{}} />
        ) : (
          <Text as="h1" fontFamily="display" fontSize={32}>
            Profile not found
          </Text>
        )}
      </Container>
    );
  }

  const name = publicProfileName(profile);
  const props: ProfileSlotProps = { profile, viewer };
  const requested = searchParams.get('tab');
  const activeTab = tabs.find((tab) => tab.key === requested)?.key ?? tabs[0]?.key;

  const save = async (changes: { avatar: AvatarRecipe } | { banner: PolyPattern }, what: string) => {
    try {
      await updateProfile(changes).unwrap();
    } catch (error) {
      if (lastAlert.current) dismissAlert(lastAlert.current);
      lastAlert.current = showAlert({
        color: 'red',
        icon: 'circle-alert',
        title: `We couldn't save your ${what}`,
        message: readApiFailure(error).message ?? 'Something went wrong. Please try again.',
        urgent: true,
      });
    }
  };

  const owner = viewer === 'owner';

  return (
    <ProfileLayout
      name={name}
      avatar={profile.avatar}
      banner={profile.banner}
      onAvatarChange={owner ? (avatar) => void save({ avatar }, 'avatar') : undefined}
      onBannerChange={owner ? (banner) => void save({ banner }, 'banner') : undefined}
      actions={actions.length > 0 ? actions.map((action) => <action.component key={action.key} {...props} />) : undefined}
      sidebar={sidebar.map((section) => (
        <Container as="section" key={section.key} flex={{ direction: 'column', gap: 10 }}>
          <Text as="h2" fontSize={13} fontWeight={600} letterSpacing={0.5} textColor={{ color: 'surface', intensity: 700 }}>
            {section.label.toUpperCase()}
          </Text>
          <section.component {...props} />
        </Container>
      ))}
    >
      <Container flex={{ direction: 'column', gap: PROFILE_CARD_GAP }}>
        {owner && !profile.firstName && (
          <Alert color="primary" icon="user-pen" title="Add your name" message="Others see you as “Member” until you do." />
        )}
        {tabs.length > 0 ? (
          <Tabs
            value={activeTab}
            onValueChange={(tab) => setSearchParams({ tab }, { replace: true })}
            // The bar is a card like the sections under it; the gap above the panels separates them.
            variant="buttons"
            bar={{ ...profileCard, padding: { all: 8 } }}
            tabs={tabs.map((tab) => ({ value: tab.key, label: tab.label, icon: tab.icon, content: <tab.component {...props} /> }))}
          />
        ) : (
          <Container {...profileCard}>
            <Text as="p" textColor={{ color: 'surface', intensity: 700 }}>
              Nothing to show here yet.
            </Text>
          </Container>
        )}
      </Container>
    </ProfileLayout>
  );
}
