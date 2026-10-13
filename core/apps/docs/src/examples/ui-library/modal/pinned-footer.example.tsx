import { useState } from 'react';
import { Button, Container, Text } from '@inithium/shared-ui-components';
import { Modal } from '@inithium/shared-ui-composites';

export default function ExampleModalPinnedFooter() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outlined" onClick={() => setOpen(true)}>Review changes</Button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Review changes"
        description="Your edits to the home page."
        maxWidth={560}
        footer={
          <Container flex={{ justify: 'between', gap: 8 }}>
            <Button leadingIcon="send" onClick={() => setOpen(false)}>Publish</Button>
            <Button variant="outlined" onClick={() => setOpen(false)}>Keep editing</Button>
          </Container>
        }
      >
        {Array.from({ length: 10 }, (_, index) => (
          <Text key={index} fontSize={14} margin={{ bottom: 12 }}>
            Change {index + 1}: the body scrolls between the title and the footer, so Publish is always in reach.
          </Text>
        ))}
      </Modal>
    </>
  );
}
