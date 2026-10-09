import { Container } from '@inithium/shared-ui-components';
import { Breadcrumbs } from '@inithium/shared-ui-composites';

export default function ExampleBreadcrumbsLongLabels() {
  return (
    <Container maxWidth={420}>
      <Breadcrumbs
        items={[
          { label: 'Knowledge base', href: '#kb' },
          { label: 'Getting the most out of scheduled publishing and drafts', href: '#scheduling' },
          { label: 'Publishing a page at a set time in another time zone' },
        ]}
      />
    </Container>
  );
}
