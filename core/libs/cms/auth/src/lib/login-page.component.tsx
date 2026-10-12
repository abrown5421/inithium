import { useRef, useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { loginRequestSchema } from '@inithium/shared-contracts';
import {
  fieldErrorsFrom,
  focusFirstError,
  readApiFailure,
  useAlerts,
  useGetCurrentUserQuery,
  useLoginMutation,
  useLogoutMutation,
  type FieldErrors,
} from '@inithium/shared-data-access';
import { hasPermission } from '@inithium/shared-permissions';
import { Button, Container, Input, Text } from '@inithium/shared-ui-components';
import { BareLayout } from '@inithium/shared-ui-layouts';

type Field = 'email' | 'password';
const FIELDS: readonly Field[] = ['email', 'password'];

/**
 * The CMS's sign-in screen: the same card on a dark backdrop as `web`'s Login, with its red alerts and per-field
 * errors (decision 0083). Accounts without CMS access are signed straight back out.
 */
export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const { data: currentUser } = useGetCurrentUserQuery();
  const [login, { isLoading }] = useLoginMutation();
  const [logout] = useLogoutMutation();
  const { show: showAlert, dismiss: dismissAlert } = useAlerts();
  const lastAlert = useRef<string | null>(null);

  const [values, setValues] = useState<Record<Field, string>>({ email: '', password: '' });
  const [errors, setErrors] = useState<FieldErrors<Field>>({});

  if (currentUser && hasPermission(currentUser.role, 'cms.access')) {
    return <Navigate to={from} replace />;
  }

  const field = (name: Field) => ({
    name,
    value: values[name],
    onValueChange: (value: string) => setValues((current) => ({ ...current, [name]: value })),
    error: errors[name],
  });

  const fail = (form: HTMLFormElement, found: FieldErrors<Field>, title: string, message: string) => {
    setErrors(found);
    if (lastAlert.current) dismissAlert(lastAlert.current);
    lastAlert.current = showAlert({ color: 'red', icon: 'circle-alert', title, message, urgent: true });
    focusFirstError(FIELDS, found, form);
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const parsed = loginRequestSchema.safeParse(values);
    if (!parsed.success) {
      return fail(form, fieldErrorsFrom<Field>(parsed.error.issues), 'There were problems signing in', 'Check the highlighted fields below.');
    }

    setErrors({});
    try {
      const user = await login(parsed.data).unwrap();
      if (!hasPermission(user.role, 'cms.access')) {
        await logout();
        return fail(form, {}, "This account can't use the CMS", 'Sign in with an owner, admin or editor account.');
      }
      navigate(from, { replace: true });
    } catch (error) {
      const failure = readApiFailure(error);
      const message = failure.message ?? 'Something went wrong. Please try again.';
      if (failure.status === 401) return fail(form, { email: true, password: message }, "We couldn't sign you in", message);
      fail(form, {}, "We couldn't sign you in", message);
    }
  }

  return (
    <Container minHeight="screen" flex={{ direction: 'column' }} bgColor={{ color: 'surface', intensity: 950 }}>
      <BareLayout>
        <form onSubmit={handleSubmit} noValidate>
          <Container flex={{ direction: 'column', gap: 20 }}>
            <Text as="h1" fontFamily="display" fontSize={26}>
              Sign in to the CMS
            </Text>
            <Input label="Email" type="email" autoComplete="email" required {...field('email')} />
            <Input label="Password" type="password" autoComplete="current-password" required {...field('password')} />
            <Button type="submit" width="full" loading={isLoading}>
              Sign in
            </Button>
          </Container>
        </form>
      </BareLayout>
    </Container>
  );
}
