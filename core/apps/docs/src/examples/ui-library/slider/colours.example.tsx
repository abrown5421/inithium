import { Container, Slider } from '@inithium/shared-ui-components';

export default function ExampleSliderColours() {
  return (
    <Container flex={{ direction: 'column', gap: 8 }} maxWidth={360}>
      <Slider aria-label="Primary" defaultValue={60} />
      <Slider aria-label="Secondary" color="secondary" defaultValue={45} />
      <Slider aria-label="Emerald" color="emerald" defaultValue={[25, 75]} />
      <Slider aria-label="Violet 700" color={{ color: 'violet', intensity: 700 }} defaultValue={80} />
    </Container>
  );
}
