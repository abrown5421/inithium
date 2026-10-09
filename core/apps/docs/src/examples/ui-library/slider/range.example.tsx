import { Container, Slider } from '@inithium/shared-ui-components';

export default function ExampleSliderRange() {
  return (
    <Container maxWidth={360}>
      <Slider
        label="Price"
        defaultValue={[20, 80]}
        max={200}
        step={5}
        minStepsBetweenThumbs={2}
        formatValue={(value) => `$${value}`}
        helperText="Thumbs stay at least $10 apart."
      />
    </Container>
  );
}
