import { useNavigate } from 'react-router-dom';
import { Breadcrumbs } from '@inithium/shared-ui-composites';

export default function ExampleBreadcrumbsBasic() {
  const navigate = useNavigate();
  return (
    <Breadcrumbs
      onNavigate={(href) => navigate(href)}
      items={[
        { label: 'UI library', href: '/ui-library' },
        { label: 'Composites', href: '/ui-library/composites' },
        { label: 'Breadcrumbs' },
      ]}
    />
  );
}
