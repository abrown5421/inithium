import { useState } from 'react';
import { Button, Text } from '@inithium/shared-ui-components';
import { Drawer } from '@inithium/shared-ui-composites';

export default function ExampleDrawerLongContent() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="ghost" onClick={() => setOpen(true)}>Release notes</Button>
      <Drawer
        open={open}
        onOpenChange={setOpen}
        title="Release notes"
        description="Everything that changed this year."
        footer={<Button width="full" onClick={() => setOpen(false)}>Done</Button>}
      >
        {Array.from({ length: 20 }, (_, index) => (
          <Text key={index} fontSize={14} margin={{ bottom: 12 }}>
            Version 2.{20 - index}: the body scrolls between the header and the footer, which stay where they are.
          </Text>
        ))}
      </Drawer>
    </>
  );
}
