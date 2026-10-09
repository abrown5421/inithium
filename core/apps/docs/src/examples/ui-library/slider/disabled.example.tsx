import { Container, Slider } from '@inithium/shared-ui-components';

export default function ExampleSliderDisabled() {
  return (
    <Container maxWidth={360}>
      <Slider label="Storage" defaultValue={[10, 60]} disabled formatValue={(value) => `${value} GB`} />
    </Container>
  );
}
