import { useRef, useState, type FormEvent, type ReactNode } from 'react';
import { changePasswordRequestSchema, passwordPolicyHint } from '@inithium/shared-contracts';
import {
  fieldErrorsFrom,
  focusFirstError,
  readApiFailure,
  useAlerts,
  useChangePasswordMutation,
  type FieldErrors,
} from '@inithium/shared-data-access';
import { Button, Container, Input } from '@inithium/shared-ui-components';

type Field = 'currentPassword' | 'newPassword' | 'confirmPassword';
const FIELDS: readonly Field[] = ['currentPassword', 'newPassword', 'confirmPassword'];
const EMPTY: Record<Field, string> = { currentPassword: '', newPassword: '', confirmPassword: '' };
const INVALID = { title: 'There were problems changing your password', message: 'Check the highlighted fields below.' };

export type PasswordChangeFormProps = {
  /** Above the fields, e.g. a heading and an explanation. */
  intro?: ReactNode;
  /** Under the submit button, e.g. a way to sign out. */
  footer?: ReactNode;
  /** Makes the submit button as wide as the form. Default false. */
  fullWidthSubmit?: boolean;
};

/**
 * Changes the signed-in user's password (decision 0088): the current password, a new one meeting the policy and its
 * confirmation. Problems show like every form's: a red alert and each field's reason. On success it shows a green
 * alert and clears itself; the API signs out every other session.
 */
export function PasswordChangeForm({ intro, footer, fullWidthSubmit = false }: PasswordChangeFormProps) {
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const { show: showAlert, dismiss: dismissAlert } = useAlerts();
  const lastAlert = useRef<string | null>(null);
  const [values, setValues] = useState<Record<Field, string>>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors<Field>>({});

  const field = (name: Field) => ({
    name,
    type: 'password' as const,
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const parsed = changePasswordRequestSchema.safeParse({ currentPassword: values.currentPassword, newPassword: values.newPassword });
    const found: FieldErrors<Field> = parsed.success ? {} : fieldErrorsFrom<Field>(parsed.error.issues);
    if (!values.confirmPassword) found.confirmPassword = 'Confirm your new password';
    else if (values.confirmPassword !== values.newPassword) found.confirmPassword = "Passwords don't match";
    if (!parsed.success || found.confirmPassword) return fail(form, found, INVALID.title, INVALID.message);

    setErrors({});
    try {
      await changePassword(parsed.data).unwrap();
      setValues(EMPTY);
      if (lastAlert.current) dismissAlert(lastAlert.current);
      lastAlert.current = showAlert({ color: 'green', icon: 'circle-check', title: 'Password changed', message: 'You’re all set.' });
    } catch (error) {
      const failure = readApiFailure(error);
      const message = failure.message ?? 'Something went wrong. Please try again.';
      if (failure.issues) return fail(form, fieldErrorsFrom<Field>(failure.issues), INVALID.title, INVALID.message);
      if (failure.field === 'currentPassword' || failure.field === 'newPassword') {
        return fail(form, { [failure.field]: message }, "We couldn't change your password", message);
      }
      fail(form, {}, "We couldn't change your password", message);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Container flex={{ direction: 'column', gap: 20 }}>
        {intro}
        <Input label="Current password" autoComplete="current-password" required {...field('currentPassword')} />
        <Input label="New password" autoComplete="new-password" required helperText={passwordPolicyHint} {...field('newPassword')} />
        <Input label="Confirm new password" autoComplete="new-password" required {...field('confirmPassword')} />
        <Container flex={{ direction: 'row' }}>
          <Button type="submit" width={fullWidthSubmit ? 'full' : undefined} loading={isLoading}>
            Change password
          </Button>
        </Container>
        {footer}
      </Container>
    </form>
  );
}
