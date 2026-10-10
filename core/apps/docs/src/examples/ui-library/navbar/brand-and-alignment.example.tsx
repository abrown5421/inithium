import type { NavItem } from '@inithium/shared-contracts';
import { Container } from '@inithium/shared-ui-components';
import { Navbar } from '@inithium/shared-ui-composites';

const logo = {
  src:
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="none" stroke="#0e7490" stroke-width="3"/><path d="M12 26l8-14 8 14z" fill="#0e7490"/></svg>',
    ),
  alt: 'Peak',
};
const links: NavItem[] = [
  { label: 'Home', href: '/', icon: 'house' },
  { label: 'Trails', href: '/trails', icon: 'map' },
  { label: 'Gear', href: '/gear', icon: 'backpack' },
];

export default function ExampleNavbarBrandAndAlignment() {
  return (
    <Container flex={{ direction: 'column', gap: 16 }}>
      <Navbar logo={logo} title="Peak Outfitters" links={links} linksAlign="start" currentPath="/trails" onNavigate={() => undefined} collapseAt="md" sticky={false} />
      <Navbar logo={logo} links={links} linksAlign="center" color="secondary" currentPath="/" onNavigate={() => undefined} collapseAt="md" sticky={false} />
      <Navbar
        title="Peak Outfitters"
        links={links}
        bgColor={{ color: 'primary', intensity: 50 }}
        color={{ color: 'primary', intensity: 700 }}
        currentPath="/gear"
        onNavigate={() => undefined}
        collapseAt="md" sticky={false}
      />
    </Container>
  );
}
