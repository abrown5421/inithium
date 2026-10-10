import { useState } from 'react';
import type { NavItem } from '@inithium/shared-contracts';
import { Container, Text } from '@inithium/shared-ui-components';
import { Navbar } from '@inithium/shared-ui-composites';

const links: NavItem[] = [
  { label: 'Home', href: '/' },
  {
    label: 'Offerings',
    children: [
      { label: 'Classes', href: '/classes' },
      { label: 'Workshops', href: '/workshops' },
      { label: 'Events', href: '/events' },
    ],
  },
  { label: 'Calendar', href: '/calendar' },
  { label: 'Instructors', href: '/instructors' },
  { label: 'Contact', href: '/contact' },
];

export default function ExampleNavbarBasic() {
  const [path, setPath] = useState('/');
  return (
    <Container flex={{ direction: 'column', gap: 12 }}>
      <Navbar title="Studio" links={links} currentPath={path} onNavigate={setPath} collapseAt="md" sticky={false} />
      <Text as="p" fontSize={12} textColor={{ color: 'surface', intensity: 700 }}>
        Current page: {path}
      </Text>
    </Container>
  );
}
