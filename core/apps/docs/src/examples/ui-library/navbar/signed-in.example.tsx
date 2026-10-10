import { useState } from 'react';
import type { NavItem, NavLink } from '@inithium/shared-contracts';
import { Button, Container, Switch, Text, Tooltip } from '@inithium/shared-ui-components';
import { Navbar } from '@inithium/shared-ui-composites';

const links: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Calendar', href: '/calendar' },
  { label: 'Instructors', href: '/instructors' },
  { label: 'Contact', href: '/contact' },
];
const userLinks: NavLink[] = [
  { label: 'Profile', href: '/profile', icon: 'user' },
  { label: 'Settings', href: '/settings', icon: 'settings' },
];

export default function ExampleNavbarSignedIn() {
  const [signedIn, setSignedIn] = useState(true);
  const [path, setPath] = useState('/calendar');

  const extras = (
    <>
      <Tooltip content="Cart">
        <Button variant="ghost" color={{ color: 'surface', intensity: 800 }} leadingIcon="shopping-cart" aria-label="Cart" padding={{ x: 6 }} />
      </Tooltip>
      <Tooltip content="Notifications">
        <Button variant="ghost" color={{ color: 'surface', intensity: 800 }} leadingIcon="bell" aria-label="Notifications" padding={{ x: 6 }} />
      </Tooltip>
    </>
  );

  return (
    <Container flex={{ direction: 'column', gap: 12 }}>
      <Switch label="Signed in" checked={signedIn} onCheckedChange={setSignedIn} />
      <Navbar
        title="Studio"
        links={links}
        userLinks={userLinks}
        user={signedIn ? { name: 'Jo Walker' } : undefined}
        ancillary={extras}
        currentPath={path}
        onNavigate={setPath}
        onLogout={() => setSignedIn(false)}
        collapseAt="md" sticky={false}
      />
      <Text as="p" fontSize={12} textColor={{ color: 'surface', intensity: 700 }}>
        Current page: {path}. Click the avatar for the account menu.
      </Text>
    </Container>
  );
}
