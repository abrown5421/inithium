import { useState } from 'react';
import { Button, Container } from '@inithium/shared-ui-components';
import { Modal } from '@inithium/shared-ui-composites';

export default function ExampleModalConfirm() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button color="rose" leadingIcon="trash-2" onClick={() => setOpen(true)}>Delete page</Button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Delete this page?"
        description="It will be removed from your site. This can't be undone."
        closeButton={false}
        maxWidth={400}
        animation={{ entrance: { name: 'zoomIn', speed: 'faster' }, exit: { name: 'zoomOut', speed: 'faster' } }}
      >
        <Container flex={{ justify: 'end', gap: 8 }}>
          <Button variant="ghost" onClick={() => setOpen(false)}>Keep it</Button>
          <Button color="rose" onClick={() => setOpen(false)}>Delete</Button>
        </Container>
      </Modal>
    </>
  );
}
