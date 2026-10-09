import { useDispatch } from 'react-redux';
import { Button, Container, Text } from '@inithium/shared-ui-components';
import { Modal } from '@inithium/shared-ui-composites';
import { openModal, useModal } from '@inithium/shared-data-access';

// Declared once, e.g. at the app root. It opens whenever the global state says 'docs-invite' is open.
function InviteModal() {
  const invite = useModal('docs-invite');
  return (
    <Modal {...invite.modalProps} title="Invite a teammate">
      <Text fontSize={14}>Opened through Redux by a component that knows nothing about this modal.</Text>
      <Container flex={{ justify: 'end' }} margin={{ top: 24 }}>
        <Button onClick={invite.close}>Close</Button>
      </Container>
    </Modal>
  );
}

// Anywhere else in the app: dispatch the action.
function InviteButton() {
  const dispatch = useDispatch();
  return <Button variant="outlined" leadingIcon="user-plus" onClick={() => dispatch(openModal('docs-invite'))}>Invite</Button>;
}

export default function ExampleModalOpenFromAnywhere() {
  return (
    <>
      <InviteButton />
      <InviteModal />
    </>
  );
}
