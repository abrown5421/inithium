import { Container, Divider } from '@inithium/shared-ui-components';

export default function ExampleDividerLabelAlignment() {
  return (
    <Container flex={{ direction: 'column', gap: 16 }}>
      <Divider label="Start" labelAlign="start" />
      <Divider label="Center" />
      <Divider label="End" labelAlign="end" />
      <Divider label="Wider gap, primary line" color="primary" padding={{ x: 24 }} />
    </Container>
  );
}
