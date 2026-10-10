import { Container, Text } from '@inithium/shared-ui-components';
import { useSite, type PageTemplateProps } from '@inithium/web-shell';

/** Core's placeholder Home page. A client replaces it by registering its own `home` template from libs/client. */
export function HomePage({ page }: PageTemplateProps) {
  const { settings } = useSite();
  return (
    <Container flex={{ direction: 'column', gap: 12 }}>
      <Text as="h1" fontFamily="display" fontSize={36}>
        {settings.siteTitle}
      </Text>
      <Text as="p" fontSize={18}>
        Welcome. This is the {page.title.toLowerCase()} page, ready to be built.
      </Text>
    </Container>
  );
}
