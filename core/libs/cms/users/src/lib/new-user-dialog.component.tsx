import { useState, type FormEvent } from 'react';
import { createUserRequestSchema, type ManagedUser, type Role } from '@inithium/shared-contracts';
import { fieldErrorsFrom, focusFirstError, readApiFailure, useAlerts, useCreateUserMutation, type FieldErrors } from '@inithium/shared-data-access';
import { Button, Container, Input, Select, Text } from '@inithium/shared-ui-components';
import { Modal } from '@inithium/shared-ui-composites';
import { ROLE_HELP, ROLE_LABELS } from './user-roles.config';

type Field = 'firstName' | 'lastName' | 'email' | 'role';
const FIELDS: readonly Field[] = ['firstName', 'lastName', 'email', 'role'];
type Values = { firstName: string; lastName: string; email: string; role: Role };
const EMPTY: Values = { firstName: '', lastName: '', email: '', role: 'user' };

export type NewUserDialogProps = {
  open: boolean;
  onClose: () => void;
  /** The roles the signed-in account may give. */
  roles: Role[];
  onCreated: (user: ManagedUser) => void;
};

/**
 * Creates an account (decision 0100): names, email and a role the creator may give. It gets the same generated avatar
 * and banner as a sign-up, and signs in with the site's temporary password, which it must then change.
 */
export function NewUserDialog({ open, onClose, roles, onCreated }: NewUserDialogProps) {
  const [createUser, { isLoading }] = useCreateUserMutation();
  const { show: showAlert } = useAlerts();
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors<Field>>({});
  // Each opening starts afresh.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setValues(EMPTY);
      setErrors({});
    }
  }
  const change = (next: Partial<Values>) => setValues((current) => ({ ...current, ...next }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const fail = (found: FieldErrors<Field>, title: string, message: string) => {
      setErrors(found);
      showAlert({ color: 'red', icon: 'circle-alert', title, message, urgent: true });
      focusFirstError(FIELDS, found, form);
    };
    const parsed = createUserRequestSchema.safeParse({ ...values, lastName: values.lastName || undefined });
    if (!parsed.success) return fail(fieldErrorsFrom<Field>(parsed.error.issues), 'There were problems with this account', 'Check the highlighted fields.');

    setErrors({});
    try {
      const user = await createUser(parsed.data).unwrap();
      showAlert({
        color: 'green',
        icon: 'user-plus',
        title: 'Account created',
        message: `${user.email} can sign in with the site’s temporary password, then chooses their own.`,
      });
      onCreated(user);
    } catch (saveError) {
      const failure = readApiFailure(saveError);
      if (failure.issues) return fail(fieldErrorsFrom<Field>(failure.issues), 'There were problems with this account', 'Check the highlighted fields.');
      const message = failure.message ?? 'Something went wrong. Please try again.';
      const field = failure.field && (FIELDS as readonly string[]).includes(failure.field) ? (failure.field as Field) : undefined;
      fail(field ? { [field]: message } : {}, 'We couldn’t create the account', message);
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={(next) => !next && onClose()}
      title="New account"
      description="They’ll sign in with this site’s temporary password and choose their own straight away."
      maxWidth={560}
    >
      <form onSubmit={handleSubmit} noValidate>
        <Container flex={{ direction: 'column', gap: 20 }}>
          <Container grid={{ columns: { base: 1, sm: 2 }, gap: 16 }}>
            <Input name="firstName" label="First name" required value={values.firstName} onValueChange={(firstName) => change({ firstName })} error={errors.firstName} />
            <Input name="lastName" label="Last name" helperText="Optional" value={values.lastName} onValueChange={(lastName) => change({ lastName })} error={errors.lastName} />
          </Container>
          <Input name="email" label="Email" type="email" required value={values.email} onValueChange={(email) => change({ email })} error={errors.email} />
          <Select
            name="role"
            label="Role"
            value={values.role}
            onValueChange={(role) => change({ role: role as Role })}
            options={roles.map((role) => ({ value: role, label: ROLE_LABELS[role] }))}
            helperText={ROLE_HELP[values.role]}
            error={errors.role}
          />
          <Container flex={{ gap: 8 }}>
            <Button type="submit" leadingIcon="user-plus" loading={isLoading}>
              Create account
            </Button>
            <Button variant="outlined" onClick={onClose}>
              Cancel
            </Button>
          </Container>
        </Container>
      </form>
    </Modal>
  );
}
