import { useState } from 'react';
import { Container, Text } from '@inithium/shared-ui-components';
import { SidebarLayout, type SidebarItem } from '@inithium/shared-ui-layouts';

const items: SidebarItem[] = [
  { label: 'Dashboard', href: '#dashboard', icon: 'layout-dashboard', exact: true },
  { label: 'Pages', href: '#pages', icon: 'file-text' },
  { label: 'Settings', href: '#settings', icon: 'settings' },
];

export default function ExampleSidebarLayoutBasic() {
  const [current, setCurrent] = useState('#pages');
  return (
    <Container height={520} overflow={{ y: 'auto' }} borderWidth={{ all: 1 }} borderColor={{ color: 'surface', intensity: 500, opacity: 30 }}>
      <SidebarLayout title="Studio" items={items} currentPath={current} onNavigate={setCurrent} user={{ name: 'Ada Lovelace' }}>
        <Text as="h1" fontFamily="display" fontSize={28}>
          {items.find((item) => item.href === current)?.label}
        </Text>
        <Text as="p" fontSize={14}>
          Pick an entry, or collapse the sidebar to icons.
        </Text>
      </SidebarLayout>
    </Container>
  );
}
