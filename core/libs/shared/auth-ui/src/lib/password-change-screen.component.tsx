import { useRef, useState, type FormEvent } from 'react';
import { changePasswordRequestSchema, passwordPolicyHint } from '@inithium/shared-contracts';
import {
  fieldErrorsFrom,
  focusFirstError,
  readApiFailure,
  useAlerts,
  useChangePasswordMutation,
  useLogoutMutation,
  type FieldErrors,
} from '@inithium/shared-data-access';
import { Button, Container, Input, Text } from '@inithium/shared-ui-components';
import { BareLayout } from '@inithium/shared-ui-layouts';

type Field = 'currentPassword' | 'newPassword' | 'confirmPassword';
const FIELDS: readonly Field[] = ['currentPassword', 'newPassword', 'confirmPassword'];
const INVALID = { title: 'There were problems changing your password', message: 'Check the highlighted fields below.' };

/**
 * The screen an account sees while it must change its password (decision 0088), in `web` and the CMS alike: a card
 * on a dark backdrop with the current password, a new one meeting the policy and its confirmation, plus a way to
 * sign out. Problems show like every form's: a red alert and each field's reason. Once changed, the app carries on.
 */
export function PasswordChangeScreen() {
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const [logout] = useLogoutMutation();
  const { show: showAlert, dismiss: dismissAlert } = useAlerts();
  const lastAlert = useRef<string | null>(null);
  const [values, setValues] = useState<Record<Field, string>>({ currentPassword: '', newPassword: '', confirmPassword: '' });
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
      if (lastAlert.current) dismissAlert(lastAlert.current);
      showAlert({ color: 'green', icon: 'circle-check', title: 'Password changed', message: 'You’re all set.' });
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
    <Container minHeight="screen" flex={{ direction: 'column' }} bgColor={{ color: 'surface', intensity: 950 }}>
      <BareLayout>
        <form onSubmit={handleSubmit} noValidate>
          <Container flex={{ direction: 'column', gap: 20 }}>
            <Container flex={{ direction: 'column', gap: 6 }}>
              <Text as="h1" fontFamily="display" fontSize={26}>
                Choose a new password
              </Text>
              <Text as="p" fontSize={14} textColor={{ color: 'surface', intensity: 700 }}>
                Your account was set up with a temporary password. Choose your own before carrying on.
              </Text>
            </Container>
            <Input label="Current password" autoComplete="current-password" required {...field('currentPassword')} />
            <Input label="New password" autoComplete="new-password" required helperText={passwordPolicyHint} {...field('newPassword')} />
            <Input label="Confirm new password" autoComplete="new-password" required {...field('confirmPassword')} />
            <Button type="submit" width="full" loading={isLoading}>
              Change password
            </Button>
            <Button variant="link" color={{ color: 'surface', intensity: 700 }} onClick={() => void logout()}>
              Sign out instead
            </Button>
          </Container>
        </form>
      </BareLayout>
    </Container>
  );
}
