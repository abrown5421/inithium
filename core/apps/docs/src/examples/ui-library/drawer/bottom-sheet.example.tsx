import { useState } from 'react';
import { Button, Container, Text } from '@inithium/shared-ui-components';
import { Drawer } from '@inithium/shared-ui-composites';

const actions = [
  { icon: 'link', label: 'Copy link' },
  { icon: 'mail', label: 'Email' },
  { icon: 'download', label: 'Download' },
] as const;

export default function ExampleDrawerBottomSheet() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outlined" leadingIcon="share-2" onClick={() => setOpen(true)}>Share</Button>
      <Drawer open={open} onOpenChange={setOpen} side="bottom" title="Share this page">
        <Container flex={{ justify: 'center', gap: 32 }}>
          {actions.map((action) => (
            <Container key={action.label} flex={{ direction: 'column', align: 'center', gap: 8 }}>
              <Button variant="outlined" leadingIcon={action.icon} aria-label={action.label} padding={{ x: 6 }} onClick={() => setOpen(false)} />
              <Text as="span" fontSize={12}>{action.label}</Text>
            </Container>
          ))}
        </Container>
      </Drawer>
    </>
  );
}
