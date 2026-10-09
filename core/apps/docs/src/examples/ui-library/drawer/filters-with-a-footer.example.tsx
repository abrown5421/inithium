import { useState } from 'react';
import { Button, Checkbox, Container, Slider, Text } from '@inithium/shared-ui-components';
import { Drawer } from '@inithium/shared-ui-composites';

export default function ExampleDrawerFilters() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="ghost" leadingIcon="sliders-horizontal" onClick={() => setOpen(true)}>Filters</Button>
      <Drawer
        open={open}
        onOpenChange={setOpen}
        side="left"
        size={320}
        title="Filters"
        footer={
          <Container flex={{ justify: 'end', gap: 8 }}>
            <Button variant="ghost" onClick={() => setOpen(false)}>Reset</Button>
            <Button onClick={() => setOpen(false)}>Apply</Button>
          </Container>
        }
      >
        <Container flex={{ direction: 'column', gap: 16 }}>
          <Text fontWeight={600}>Category</Text>
          <Container flex={{ direction: 'column' }}>
            <Checkbox label="Shirts" defaultChecked />
            <Checkbox label="Bags" />
            <Checkbox label="Shoes" />
          </Container>
          <Slider label="Price" defaultValue={[20, 120]} max={200} formatValue={(value) => `$${value}`} />
        </Container>
      </Drawer>
    </>
  );
}
