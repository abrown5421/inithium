import { Container } from '@inithium/shared-ui-components';
import { Footer } from '@inithium/shared-ui-composites';

export default function ExampleFooterNarrow() {
  return (
    <Container maxWidth={360}>
      <Footer
        links={[
          { label: 'Home', href: '/' },
          { label: 'Calendar', href: '/calendar' },
          { label: 'Contact', href: '/contact' },
        ]}
        secondaryLinks={[
          { label: 'Privacy Policy', href: '/privacy' },
          { label: 'Policies', href: '/policies' },
        ]}
        copyright="Studio"
        currentPath="/"
        onNavigate={() => undefined}
      />
    </Container>
  );
}
