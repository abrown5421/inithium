import { useState } from 'react';
import { Button, Container, Icon, Text } from '@inithium/shared-ui-components';
import { Modal } from '@inithium/shared-ui-composites';

export default function ExampleModalCustomLook() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outlined" color="secondary" onClick={() => setOpen(true)}>Open a wide, tinted modal</Button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="What's new"
        hideTitle
        maxWidth={640}
        padding={{ all: 32 }}
        radius={{ all: 20 }}
        bgColor={{ color: 'secondary', intensity: 50 }}
        overlayColor={{ color: 'secondary', intensity: 950, opacity: 50 }}
        animation={{ entrance: { name: 'slideInDown', speed: 'fast' }, exit: { name: 'slideOutUp', speed: 'fast' } }}
      >
        <Container flex={{ direction: 'column', align: 'center', gap: 12 }}>
          <Icon name="sparkles" size={40} textColor="secondary" />
          <Text as="h2" fontSize={24} fontWeight={700}>What's new</Text>
          <Text align="center">The title is hidden from view (screen readers still get it) because the content has its own heading.</Text>
        </Container>
      </Modal>
    </>
  );
}
