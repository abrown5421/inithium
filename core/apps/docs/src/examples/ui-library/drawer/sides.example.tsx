import { useState } from 'react';
import { Button, Container, Text } from '@inithium/shared-ui-components';
import { Drawer } from '@inithium/shared-ui-composites';
import type { DrawerSide } from '@inithium/shared-contracts';

const sides: DrawerSide[] = ['right', 'left', 'top', 'bottom'];

export default function ExampleDrawerSides() {
  const [side, setSide] = useState<DrawerSide>('right');
  const [open, setOpen] = useState(false);
  return (
    <>
      <Container flex={{ wrap: 'wrap', gap: 8 }}>
        {sides.map((value) => (
          <Button key={value} variant="outlined" onClick={() => { setSide(value); setOpen(true); }}>
            From the {value}
          </Button>
        ))}
      </Container>
      <Drawer open={open} onOpenChange={setOpen} side={side} title={`From the ${side}`}>
        <Text>Slides in from the {side} and back out to it.</Text>
      </Drawer>
    </>
  );
}
