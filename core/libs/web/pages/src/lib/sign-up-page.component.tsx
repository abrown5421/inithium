import { Link } from 'react-router-dom';
import { Container, Text } from '@inithium/shared-ui-components';
import type { PageTemplateProps } from '@inithium/web-shell';

/** Core's placeholder Sign up page: registration waits for the password policy (decision 0024). */
export function SignUpPage({ page }: PageTemplateProps) {
  return (
    <Container flex={{ direction: 'column', gap: 16 }}>
      <Text as="h1" fontFamily="display" fontSize={26}>
        {page.title}
      </Text>
      <Text as="p">Creating an account is coming soon.</Text>
      <Text as="p" fontSize={14}>
        Already have one? <Link to="/login">Sign in</Link>
      </Text>
    </Container>
  );
}
