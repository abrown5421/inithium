import { useState } from 'react';
import { type ColorValue, type ManagedUser, type Role } from '@inithium/shared-contracts';
import {
  readApiFailure,
  useAlerts,
  useDeleteUsersMutation,
  useResetUserPasswordMutation,
  useUpdateUserMutation,
} from '@inithium/shared-data-access';
import { Button, Container, Divider, Input, Select, Text } from '@inithium/shared-ui-components';
import { Modal } from '@inithium/shared-ui-composites';
import { ROLE_COLORS, ROLE_HELP, ROLE_LABELS } from './user-roles.config';
import { UserAvatar } from './user-avatar.component';

/** What the signed-in account may do to the open one. */
export type UserAbilities = {
  /** Change names and role, and reset the password (users.edit, and the account is at their level or below). */
  edit: boolean;
  /** Delete it (users.delete, at their level or below, not themselves). */
  delete: boolean;
  /** It's the signed-in account: its role and password are changed elsewhere. */
  self: boolean;
  /** The roles they may give. */
  roles: Role[];
  /** USER_TEMP_PASSWORD is set, so resets are possible. */
  tempPasswordSet: boolean;
};

export type UserDetailsProps = {
  /** The account to show; the modal is open while there is one. */
  user: ManagedUser | null;
  abilities: UserAbilities;
  onClose: () => void;
};

export const managedUserName = (user: Pick<ManagedUser, 'firstName' | 'lastName' | 'email'>) =>
  [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;

/** A small coloured label, e.g. a role. */
export function Badge({ label, color }: { label: string; color: ColorValue }) {
  return (
    <Text as="span" fontSize={11} fontWeight={600} padding={{ x: 8, y: 2 }} radius={{ all: 999 }} bgColor={color} textColor={{ color: 'surface', intensity: 50 }}>
      {label}
    </Text>
  );
}

/** A row of the details list. */
function Fact({ label, value }: { label: string; value: string }) {
  return (
    <Container flex={{ direction: 'row', justify: 'between', gap: 12 }}>
      <Text as="span" fontSize={14} textColor={{ color: 'surface', intensity: 700 }}>
        {label}
      </Text>
      <Text as="span" fontSize={14} align="end">
        {value}
      </Text>
    </Container>
  );
}

/**
 * One account in a Modal (decision 0100): its avatar, names and role to edit, its details, and in the footer Save,
 * Reset password and Delete, each as the signed-in account is allowed. Reset and Delete confirm in the footer.
 */
export function UserDetails({ user, abilities, onClose }: UserDetailsProps) {
  // Keep the last account while the Modal animates out, and start the form afresh for each one.
  const [shown, setShown] = useState(user);
  const [form, setForm] = useState({ firstName: user?.firstName ?? '', lastName: user?.lastName ?? '', role: user?.role ?? 'user' });
  const [confirming, setConfirming] = useState<'reset' | 'delete' | null>(null);
  if (user && (user.id !== shown?.id || user !== shown)) {
    if (user.id !== shown?.id) {
      setForm({ firstName: user.firstName ?? '', lastName: user.lastName ?? '', role: user.role });
      setConfirming(null);
    }
    setShown(user);
  }
  const target = user ?? shown;
  const [updateUser, updating] = useUpdateUserMutation();
  const [resetPassword, resetting] = useResetUserPasswordMutation();
  const [deleteUsers, deleting] = useDeleteUsersMutation();
  const { show: showAlert } = useAlerts();
  if (!target) return null;

  const name = managedUserName(target);
  const changed =
    form.firstName.trim() !== (target.firstName ?? '') || form.lastName.trim() !== (target.lastName ?? '') || form.role !== target.role;
  const roleOptions = abilities.roles.includes(target.role) ? abilities.roles : [target.role, ...abilities.roles];
  const failed = (title: string, error: unknown) =>
    showAlert({ color: 'red', icon: 'circle-alert', title, message: readApiFailure(error).message ?? 'Something went wrong. Please try again.', urgent: true });
  const close = () => {
    setConfirming(null);
    onClose();
  };

  const save = async () => {
    try {
      await updateUser({
        id: target.id,
        changes: {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          ...(form.role !== target.role ? { role: form.role } : {}),
        },
      }).unwrap();
      showAlert({
        color: 'green',
        icon: 'circle-check',
        title: 'Account saved',
        message: form.role !== target.role ? `${name} is now ${ROLE_LABELS[form.role]} and was signed out, so the change applies at once.` : `${name} is up to date.`,
      });
    } catch (error) {
      failed('We couldn’t save the account', error);
    }
  };
  const reset = async () => {
    try {
      await resetPassword(target.id).unwrap();
      setConfirming(null);
      showAlert({ color: 'green', icon: 'key-round', title: 'Password reset', message: `${name} was signed out and must sign in with the temporary password, then choose a new one.` });
    } catch (error) {
      failed('We couldn’t reset the password', error);
    }
  };
  const remove = async () => {
    try {
      const result = await deleteUsers([target.id]).unwrap();
      const problem = result.failed[0];
      if (problem) {
        setConfirming(null);
        showAlert({ color: 'red', icon: 'circle-alert', title: `${name} wasn’t deleted`, message: problem.reason, urgent: true });
        return;
      }
      showAlert({ color: 'green', icon: 'trash-2', title: 'Account deleted', message: `${name}’s account is gone.` });
      close();
    } catch (error) {
      failed('We couldn’t delete the account', error);
    }
  };

  const footer =
    confirming === 'delete' ? (
      <Container flex={{ direction: { base: 'column', sm: 'row' }, align: { base: 'start', sm: 'center' }, justify: 'between', gap: 12 }}>
        <Text as="p" fontSize={14} role="alert">
          <Text as="strong" fontWeight={600}>
            Delete {name}?
          </Text>{' '}
          Their account, profile and pictures are removed for good.
        </Text>
        <Container flex={{ gap: 8 }} flexItem={{ shrink: 0 }}>
          <Button color="red" leadingIcon="trash-2" loading={deleting.isLoading} onClick={() => void remove()}>
            Delete account
          </Button>
          <Button variant="outlined" onClick={() => setConfirming(null)}>
            Keep it
          </Button>
        </Container>
      </Container>
    ) : confirming === 'reset' ? (
      <Container flex={{ direction: { base: 'column', sm: 'row' }, align: { base: 'start', sm: 'center' }, justify: 'between', gap: 12 }}>
        <Text as="p" fontSize={14} role="alert">
          <Text as="strong" fontWeight={600}>
            Reset {name}’s password?
          </Text>{' '}
          They’re signed out and must sign in with the temporary password.
        </Text>
        <Container flex={{ gap: 8 }} flexItem={{ shrink: 0 }}>
          <Button leadingIcon="key-round" loading={resetting.isLoading} onClick={() => void reset()}>
            Reset password
          </Button>
          <Button variant="outlined" onClick={() => setConfirming(null)}>
            Cancel
          </Button>
        </Container>
      </Container>
    ) : (
      <Container flex={{ direction: 'row', wrap: 'wrap', justify: 'between', gap: 8 }}>
        <Container flex={{ direction: 'row', wrap: 'wrap', gap: 8 }}>
          {abilities.edit && (
            <Button leadingIcon="save" loading={updating.isLoading} disabled={!changed || !form.firstName.trim()} onClick={() => void save()}>
              Save
            </Button>
          )}
          <Button variant="outlined" leadingIcon="external-link" onClick={() => window.open(`/profile/${target.id}`, '_blank', 'noopener')}>
            View profile
          </Button>
          {abilities.edit && !abilities.self && abilities.tempPasswordSet && (
            <Button variant="outlined" leadingIcon="key-round" onClick={() => setConfirming('reset')}>
              Reset password
            </Button>
          )}
        </Container>
        {abilities.delete && (
          <Button color="red" variant="outlined" leadingIcon="trash-2" onClick={() => setConfirming('delete')}>
            Delete
          </Button>
        )}
      </Container>
    );

  return (
    <Modal open={user !== null} onOpenChange={(open) => !open && close()} title={name} description={target.email} maxWidth={640} footer={footer}>
      <Container flex={{ direction: 'column', gap: 20 }}>
        <Container flex={{ align: 'center', gap: 16 }}>
          <UserAvatar user={target} name={name} label={`${name}'s avatar`} size={64} />
          <Container flex={{ direction: 'row', wrap: 'wrap', gap: 6 }}>
            <Badge label={ROLE_LABELS[target.role]} color={ROLE_COLORS[target.role]} />
            {target.passwordChangeRequired && <Badge label="Temporary password" color={{ color: 'amber', intensity: 600 }} />}
          </Container>
        </Container>

        <Container grid={{ columns: { base: 1, sm: 2 }, gap: 16 }}>
          <Input label="First name" value={form.firstName} disabled={!abilities.edit} onValueChange={(firstName) => setForm({ ...form, firstName })} />
          <Input label="Last name" value={form.lastName} disabled={!abilities.edit} onValueChange={(lastName) => setForm({ ...form, lastName })} />
        </Container>
        <Select
          label="Role"
          value={form.role}
          disabled={!abilities.edit || abilities.self}
          onValueChange={(role) => setForm({ ...form, role: role as Role })}
          options={roleOptions.map((role) => ({ value: role, label: ROLE_LABELS[role] }))}
          helperText={
            abilities.self
              ? 'You can’t change your own role.'
              : form.role !== target.role
                ? `${ROLE_HELP[form.role]} Saving signs them out so the change applies at once.`
                : ROLE_HELP[form.role]
          }
        />

        <Divider />
        <Container flex={{ direction: 'column', gap: 8 }}>
          <Fact label="Joined" value={new Date(target.createdAt).toLocaleDateString()} />
          <Fact label="Created" value={target.createdBy ? 'In the CMS' : 'Signed up (or seeded)'} />
          <Fact label="Password" value={target.passwordChangeRequired ? 'Still the temporary one' : 'Chosen by them'} />
        </Container>
      </Container>
    </Modal>
  );
}
