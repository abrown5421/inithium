import { Breadcrumbs } from '@inithium/shared-ui-composites';

export default function ExampleBreadcrumbsCollapsed() {
  return (
    <Breadcrumbs
      maxItems={4}
      items={[
        { label: 'Home', href: '#home', icon: 'house' },
        { label: 'Clients', href: '#clients' },
        { label: 'Acme', href: '#acme' },
        { label: 'Sites', href: '#sites' },
        { label: 'Marketing', href: '#marketing' },
        { label: 'Pages', href: '#pages' },
        { label: 'Pricing' },
      ]}
    />
  );
}
