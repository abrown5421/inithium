import { Container, Slider } from '@inithium/shared-ui-components';

export default function ExampleSliderValueLabel() {
  return (
    <Container flex={{ direction: 'column', gap: 16 }} maxWidth={360}>
      <Slider aria-label="Auto" defaultValue={30} />
      <Slider aria-label="Always" defaultValue={50} valueLabel="always" />
      <Slider aria-label="Off" defaultValue={70} valueLabel="off" />
    </Container>
  );
}
