import { Button, Container, Tooltip } from '@inithium/shared-ui-components';

export default function ExampleTooltipDelay() {
  return (
    <Container flex={{ gap: 12 }}>
      <Tooltip content="Opens at once" delay={0}>
        <Button variant="ghost">No delay</Button>
      </Tooltip>
      <Tooltip content="Opens after 500ms">
        <Button variant="ghost">Default</Button>
      </Tooltip>
      <Tooltip content="Opens after a second" delay={1000}>
        <Button variant="ghost">One second</Button>
      </Tooltip>
    </Container>
  );
}
