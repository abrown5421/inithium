import { useState } from 'react';
import { Button, Container, Text } from '@inithium/shared-ui-components';
import { Modal } from '@inithium/shared-ui-composites';

export default function ExampleModalBasic() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open modal</Button>
      <Modal open={open} onOpenChange={setOpen} title="Welcome back" description="Here's what changed since your last visit.">
        <Text fontSize={14}>Pages now save automatically, and you can schedule posts from the editor.</Text>
        <Container flex={{ justify: 'end' }} margin={{ top: 24 }}>
          <Button onClick={() => setOpen(false)}>Got it</Button>
        </Container>
      </Modal>
    </>
  );
}
