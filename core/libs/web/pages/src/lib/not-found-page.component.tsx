import { useNavigate } from 'react-router-dom';
import { Button, Container, Text } from '@inithium/shared-ui-components';
import type { PageTemplateProps } from '@inithium/web-shell';

/** Core's Not Found page: unknown addresses and unpublished pages (decision 0079). */
export function NotFoundPage({ page }: PageTemplateProps) {
  const navigate = useNavigate();
  return (
    <Container flex={{ direction: 'column', align: 'start', gap: 16 }}>
      <Text as="h1" fontFamily="display" fontSize={32}>
        {page.title}
      </Text>
      <Text as="p">There's nothing at this address. It may have moved, or the link may be wrong.</Text>
      <Button leadingIcon="house" onClick={() => navigate('/')}>
        Go home
      </Button>
    </Container>
  );
}
