import { Button, Container, Tooltip } from '@inithium/shared-ui-components';

export default function ExampleTooltipColours() {
  return (
    <Container flex={{ wrap: 'wrap', gap: 12 }}>
      <Tooltip content="Default: the darkest surface">
        <Button variant="ghost">Default</Button>
      </Tooltip>
      <Tooltip content="Primary bubble" color="primary">
        <Button variant="ghost">Primary</Button>
      </Tooltip>
      <Tooltip content="Deleting can't be undone" color="rose">
        <Button variant="ghost" color="rose" leadingIcon="trash-2">Delete</Button>
      </Tooltip>
      <Tooltip content="No arrow" arrow={false}>
        <Button variant="ghost">No arrow</Button>
      </Tooltip>
    </Container>
  );
}
