import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { passwordPolicyHint, registerRequestSchema } from '@inithium/shared-contracts';
import { useRegisterMutation } from '@inithium/shared-data-access';
import { Button, Container, Input, Text } from '@inithium/shared-ui-components';
import { Alert } from '@inithium/shared-ui-composites';
import type { PageTemplateProps } from '@inithium/web-shell';
import { fieldErrorsFrom, focusFirstError, readApiFailure, type FieldErrors } from './form-errors.service';

type Field = 'firstName' | 'lastName' | 'email' | 'password' | 'confirmPassword';
const FIELDS: readonly Field[] = ['firstName', 'lastName', 'email', 'password', 'confirmPassword'];
const EMPTY: Record<Field, string> = { firstName: '', lastName: '', email: '', password: '', confirmPassword: '' };

type Problem = { title: string; message: string };
const INVALID: Problem = { title: 'There were problems with your sign-up', message: 'Check the highlighted fields below.' };

/**
 * Core's Sign up page (decision 0083): first name, an optional last name, email, password and its confirmation,
 * checked against the password policy (decision 0024). Problems show a red alert and highlight each field with
 * the reason. Once the account exists the visitor is signed in, and the shell sends them on.
 */
export function SignUpPage({ page }: PageTemplateProps) {
  const [register, { isLoading }] = useRegisterMutation();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<FieldErrors<Field>>({});
  const [problem, setProblem] = useState<Problem | null>(null);

  const field = (name: Field) => ({
    value: values[name],
    onValueChange: (value: string) => setValues((current) => ({ ...current, [name]: value })),
    name,
    error: errors[name],
  });

  const fail = (form: HTMLFormElement, found: FieldErrors<Field>, next: Problem) => {
    setErrors(found);
    setProblem(next);
    focusFirstError(FIELDS, found, form);
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const request = {
      firstName: values.firstName,
      lastName: values.lastName.trim() || undefined,
      email: values.email,
      password: values.password,
    };
    const parsed = registerRequestSchema.safeParse(request);
    const found: FieldErrors<Field> = parsed.success ? {} : fieldErrorsFrom<Field>(parsed.error.issues);
    if (!values.confirmPassword) found.confirmPassword = 'Confirm your password';
    else if (values.confirmPassword !== values.password) found.confirmPassword = "Passwords don't match";
    if (!parsed.success || found.confirmPassword) return fail(form, found, INVALID);

    setErrors({});
    setProblem(null);
    try {
      await register(parsed.data).unwrap();
    } catch (error) {
      const failure = readApiFailure(error);
      if (failure.issues) return fail(form, fieldErrorsFrom<Field>(failure.issues), INVALID);
      if (failure.field === 'email') {
        return fail(form, { email: failure.message }, { title: "We couldn't create your account", message: failure.message ?? '' });
      }
      fail(form, {}, { title: "We couldn't create your account", message: failure.message ?? 'Something went wrong. Please try again.' });
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Container flex={{ direction: 'column', gap: 20 }}>
        <Text as="h1" fontFamily="display" fontSize={26}>
          {page.title}
        </Text>
        {problem && (
          <Alert role="alert" color="red" icon="circle-alert" title={problem.title} message={problem.message} onDismiss={() => setProblem(null)} />
        )}
        <Input label="First name" autoComplete="given-name" required {...field('firstName')} />
        <Input label="Last name" autoComplete="family-name" helperText="Optional" {...field('lastName')} />
        <Input label="Email" type="email" autoComplete="email" required {...field('email')} />
        <Input label="Password" type="password" autoComplete="new-password" required helperText={passwordPolicyHint} {...field('password')} />
        <Input label="Confirm password" type="password" autoComplete="new-password" required {...field('confirmPassword')} />
        <Button type="submit" width="full" loading={isLoading}>
          Create account
        </Button>
        <Text as="p" fontSize={14} align="center">
          Already have an account? <Link to="/login">Sign in</Link>
        </Text>
      </Container>
    </form>
  );
}
