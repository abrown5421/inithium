import type { NavItem, NavLink } from '@inithium/shared-contracts';
import { Container, Text } from '@inithium/shared-ui-components';
import { Navbar } from '@inithium/shared-ui-composites';

const links: NavItem[] = [
  { label: 'Home', href: '/' },
  {
    label: 'Offerings',
    children: [
      { label: 'Classes', href: '/classes' },
      { label: 'Workshops', href: '/workshops' },
    ],
  },
  { label: 'Calendar', href: '/calendar' },
  { label: 'Contact', href: '/contact' },
];
const userLinks: NavLink[] = [{ label: 'Profile', href: '/profile', icon: 'user' }];

export default function ExampleNavbarNarrow() {
  return (
    <Container flex={{ direction: 'column', gap: 16 }} maxWidth={480}>
      <Text as="span" fontSize={12}>
        Signed out: the menu button opens the links and Login.
      </Text>
      <Navbar title="Studio" links={links} currentPath="/calendar" onNavigate={() => undefined} sticky={false} />
      <Text as="span" fontSize={12}>
        Signed in: the avatar opens the links, the profile links and Logout.
      </Text>
      <Navbar
        title="Studio"
        links={links}
        userLinks={userLinks}
        user={{ name: 'Jo Walker', avatar: { style: 'glass', seed: 'jo' } }}
        currentPath="/calendar"
        onNavigate={() => undefined}
        sticky={false}
      />
    </Container>
  );
}
