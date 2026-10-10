import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { loginRequestSchema } from '@inithium/shared-contracts';
import { getApiErrorMessage, useLoginMutation } from '@inithium/shared-data-access';
import { Button, Container, Input, Text } from '@inithium/shared-ui-components';
import type { PageTemplateProps } from '@inithium/web-shell';

/**
 * Core's Login page: signs in any account. Once signed in, the shell sends the visitor on to where they were going
 * (or Home), as it does for every signed-out-only page (decision 0079).
 */
export function LoginPage({ page }: PageTemplateProps) {
  const [login, { isLoading }] = useLoginMutation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const parsed = loginRequestSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Check your email and password');
      return;
    }
    try {
      await login(parsed.data).unwrap();
    } catch (loginError) {
      setError(getApiErrorMessage(loginError, 'Something went wrong. Please try again.'));
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Container flex={{ direction: 'column', gap: 20 }}>
        <Text as="h1" fontFamily="display" fontSize={26}>
          {page.title}
        </Text>
        <Input label="Email" type="email" autoComplete="email" value={email} onValueChange={setEmail} />
        <Input label="Password" type="password" autoComplete="current-password" value={password} onValueChange={setPassword} />
        {error && (
          <Text as="p" role="alert" fontSize={14} textColor={{ color: 'red', intensity: 600 }}>
            {error}
          </Text>
        )}
        <Button type="submit" width="full" loading={isLoading}>
          Sign in
        </Button>
        <Text as="p" fontSize={14} align="center">
          No account yet? <Link to="/sign-up">Sign up</Link>
        </Text>
      </Container>
    </form>
  );
}
