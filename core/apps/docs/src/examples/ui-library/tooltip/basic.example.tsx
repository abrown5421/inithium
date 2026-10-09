import { Button, Container, Icon, Tooltip } from '@inithium/shared-ui-components';

export default function ExampleTooltipBasic() {
  return (
    <Container flex={{ align: 'center', gap: 16 }}>
      <Tooltip content="Saves a copy to your drafts">
        <Button variant="outlined">Save draft</Button>
      </Tooltip>
      <Tooltip content="Your plan renews on 1 November">
        <Icon name="info" label="Plan details" textColor={{ color: 'surface', intensity: 600 }} tabIndex={0} />
      </Tooltip>
    </Container>
  );
}
