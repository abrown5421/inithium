import { Container } from '@inithium/shared-ui-components';
import { Breadcrumbs } from '@inithium/shared-ui-composites';

export default function ExampleBreadcrumbsIconsAndSeparators() {
  return (
    <Container flex={{ direction: 'column', gap: 16 }}>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '#home', icon: 'house', iconOnly: true },
          { label: 'Settings', href: '#settings', icon: 'settings' },
          { label: 'Billing' },
        ]}
      />
      <Breadcrumbs
        separator="/"
        color="secondary"
        items={[
          { label: 'Projects', href: '#projects' },
          { label: 'Website redesign', href: '#website' },
          { label: 'Brief' },
        ]}
      />
      <Breadcrumbs
        separator="slash"
        items={[
          { label: 'Store', href: '#store' },
          { label: 'Archived' },
          { label: 'Spring sale' },
        ]}
      />
    </Container>
  );
}
