import { useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { loginRequestSchema } from '@inithium/shared-contracts';
import { useAlerts, useLoginMutation } from '@inithium/shared-data-access';
import { Button, Container, Input, Text } from '@inithium/shared-ui-components';
import type { PageTemplateProps } from '@inithium/web-shell';
import { fieldErrorsFrom, focusFirstError, readApiFailure, type FieldErrors } from './form-errors.service';

type Field = 'email' | 'password';
const FIELDS: readonly Field[] = ['email', 'password'];

type Problem = { title: string; message: string };
const INVALID: Problem = { title: 'There were problems signing in', message: 'Check the highlighted fields below.' };

/**
 * Core's Login page: signs in any account. Problems raise a red alert in the app's AlertStack and highlight each
 * field with the reason, as on Sign up (decision 0083). Once signed in, the shell sends the visitor on to where they were going (or Home), as
 * it does for every signed-out-only page (decision 0079).
 */
export function LoginPage({ page }: PageTemplateProps) {
  const [login, { isLoading }] = useLoginMutation();
  const [values, setValues] = useState<Record<Field, string>>({ email: '', password: '' });
  const [errors, setErrors] = useState<FieldErrors<Field>>({});
  const { show: showAlert, dismiss: dismissAlert } = useAlerts();
  // This form's last alert, replaced by the next one so only the latest problem shows.
  const lastAlert = useRef<string | null>(null);

  const field = (name: Field) => ({
    value: values[name],
    onValueChange: (value: string) => setValues((current) => ({ ...current, [name]: value })),
    name,
    error: errors[name],
  });

  const fail = (form: HTMLFormElement, found: FieldErrors<Field>, next: Problem) => {
    setErrors(found);
    // The app's AlertStack (bottom right), urgent so screen readers hear it at once.
    if (lastAlert.current) dismissAlert(lastAlert.current);
    lastAlert.current = showAlert({ color: 'red', icon: 'circle-alert', title: next.title, message: next.message, urgent: true });
    focusFirstError(FIELDS, found, form);
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const parsed = loginRequestSchema.safeParse(values);
    if (!parsed.success) return fail(form, fieldErrorsFrom<Field>(parsed.error.issues), INVALID);

    setErrors({});
    try {
      await login(parsed.data).unwrap();
    } catch (error) {
      const failure = readApiFailure(error);
      const message = failure.message ?? 'Something went wrong. Please try again.';
      // Wrong credentials don't say which field was wrong, so both are marked.
      if (failure.status === 401) return fail(form, { email: true, password: message }, { title: "We couldn't sign you in", message });
      fail(form, {}, { title: "We couldn't sign you in", message });
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Container flex={{ direction: 'column', gap: 20 }}>
        <Text as="h1" fontFamily="display" fontSize={26}>
          {page.title}
        </Text>
        <Input label="Email" type="email" autoComplete="email" required {...field('email')} />
        <Input label="Password" type="password" autoComplete="current-password" required {...field('password')} />
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
