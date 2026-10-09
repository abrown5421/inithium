import { Container, Slider } from '@inithium/shared-ui-components';

export default function ExampleSliderStepsAndMarks() {
  return (
    <Container flex={{ direction: 'column', gap: 24 }} maxWidth={360}>
      <Slider label="Progress" defaultValue={50} step={25} marks formatValue={(value) => `${value}%`} />
      <Slider
        label="Size"
        defaultValue={1}
        min={0}
        max={2}
        valueLabel="off"
        formatValue={(value) => ['Small', 'Medium', 'Large'][value]}
        marks={[
          { value: 0, label: 'Small' },
          { value: 1, label: 'Medium' },
          { value: 2, label: 'Large' },
        ]}
      />
    </Container>
  );
}
