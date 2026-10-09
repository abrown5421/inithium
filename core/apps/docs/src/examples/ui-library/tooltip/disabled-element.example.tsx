import { Button, Container, Tooltip } from '@inithium/shared-ui-components';

export default function ExampleTooltipDisabledElement() {
  return (
    <Container flex={{ align: 'center', gap: 12 }}>
      <Tooltip content="Add a payment method first">
        <Button disabled>Upgrade</Button>
      </Tooltip>
      <Tooltip content="Saving…" side="right">
        <Button variant="outlined" loading>Save</Button>
      </Tooltip>
    </Container>
  );
}
