import { useState } from 'react';
import { Button, Text } from '@inithium/shared-ui-components';
import { Modal } from '@inithium/shared-ui-composites';

export default function ExampleModalLongContent() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="ghost" onClick={() => setOpen(true)}>Read the terms</Button>
      <Modal open={open} onOpenChange={setOpen} title="Terms of service">
        {Array.from({ length: 12 }, (_, index) => (
          <Text key={index} fontSize={14} margin={{ bottom: 12 }}>
            {index + 1}. The panel never grows taller than the window. When its content is longer, it scrolls inside the
            panel while the page behind it stays still.
          </Text>
        ))}
      </Modal>
    </>
  );
}
