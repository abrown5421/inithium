import { useState } from 'react';
import type { NavItem, NavLink } from '@inithium/shared-contracts';
import { Container, Text } from '@inithium/shared-ui-components';
import { Footer } from '@inithium/shared-ui-composites';

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
const secondaryLinks: NavLink[] = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Policies', href: '/policies' },
];

export default function ExampleFooterBasic() {
  const [path, setPath] = useState('/calendar');
  return (
    <Container flex={{ direction: 'column', gap: 12 }}>
      <Footer links={links} secondaryLinks={secondaryLinks} copyright="Studio" currentPath={path} onNavigate={setPath} />
      <Text as="p" fontSize={12} textColor={{ color: 'surface', intensity: 700 }}>
        Current page: {path}
      </Text>
    </Container>
  );
}
