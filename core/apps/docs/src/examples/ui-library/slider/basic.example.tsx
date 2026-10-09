import { Container, Slider } from '@inithium/shared-ui-components';

export default function ExampleSliderBasic() {
  return (
    <Container maxWidth={360}>
      <Slider label="Volume" defaultValue={40} />
    </Container>
  );
}
