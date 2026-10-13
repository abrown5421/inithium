import { useState } from 'react';
import type { DeleteUsersResponse, ManagedUser } from '@inithium/shared-contracts';
import { readApiFailure, useAlerts, useDeleteUsersMutation } from '@inithium/shared-data-access';
import { Button, Container, Text } from '@inithium/shared-ui-components';
import { Modal } from '@inithium/shared-ui-composites';
import { managedUserName } from './user-details.component';

/** How many names the confirmation lists before "and N more". */
const LISTED = 10;

export type DeleteUsersDialogProps = {
  /** The accounts to delete; the dialog is open while there are any. */
  users: ManagedUser[];
  onClose: () => void;
  /** Called with the result, so the screen can drop the deleted ones from its selection. */
  onDone: (result: DeleteUsersResponse) => void;
};

/**
 * Confirms deleting accounts, one or many (decision 0100), naming them. Deleting is permanent. Accounts the api
 * refuses (e.g. the last owner) are reported with the reason; the rest are deleted.
 */
export function DeleteUsersDialog({ users, onClose, onDone }: DeleteUsersDialogProps) {
  const [deleteUsers, { isLoading }] = useDeleteUsersMutation();
  const { show: showAlert } = useAlerts();
  // Keep the last list while the Modal animates out.
  const [shown, setShown] = useState(users);
  if (users.length > 0 && users !== shown) setShown(users);
  const target = users.length > 0 ? users : shown;
  const count = target.length;
  const noun = count === 1 ? 'account' : 'accounts';

  const confirm = async () => {
    try {
      const result = await deleteUsers(target.map((user) => user.id)).unwrap();
      if (result.deleted.length > 0) {
        showAlert({ color: 'green', icon: 'trash-2', title: `${result.deleted.length} ${result.deleted.length === 1 ? 'account' : 'accounts'} deleted`, message: 'Their profiles and pictures are gone.' });
      }
      if (result.failed.length > 0) {
        showAlert({
          color: 'red',
          icon: 'circle-alert',
          title: `${result.failed.length} ${result.failed.length === 1 ? 'account wasn’t' : 'accounts weren’t'} deleted`,
          message: result.failed.map((failure) => `${failure.name}: ${failure.reason}`).join(' '),
          urgent: true,
          duration: null,
        });
      }
      onDone(result);
      onClose();
    } catch (error) {
      showAlert({ color: 'red', icon: 'circle-alert', title: 'We couldn’t delete the accounts', message: readApiFailure(error).message ?? 'Something went wrong. Please try again.', urgent: true });
    }
  };

  return (
    <Modal open={users.length > 0} onOpenChange={(open) => !open && onClose()} title={`Delete ${count} ${noun}?`} maxWidth={520}>
      <Container flex={{ direction: 'column', gap: 16 }}>
        <Container as="ul" flex={{ direction: 'column', gap: 4 }} padding={{ left: 20 }}>
          {target.slice(0, LISTED).map((user) => (
            <Container as="li" key={user.id}>
              <Text as="span" fontSize={14}>
                {managedUserName(user)}{' '}
                <Text as="span" fontSize={13} textColor={{ color: 'surface', intensity: 700 }}>
                  ({user.email})
                </Text>
              </Text>
            </Container>
          ))}
          {count > LISTED && (
            <Container as="li">
              <Text as="span" fontSize={14} textColor={{ color: 'surface', intensity: 700 }}>
                and {count - LISTED} more
              </Text>
            </Container>
          )}
        </Container>
        <Text as="p" fontSize={14}>
          Their accounts, profiles and pictures, and anything plugins keep about them, are removed for good. This can’t be undone.
        </Text>
        <Container flex={{ gap: 8 }}>
          <Button color="red" leadingIcon="trash-2" loading={isLoading} onClick={() => void confirm()}>
            Delete {count} {noun}
          </Button>
          <Button variant="outlined" onClick={onClose}>
            Keep them
          </Button>
        </Container>
      </Container>
    </Modal>
  );
}
