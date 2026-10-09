import { Container, Select } from '@inithium/shared-ui-components';

const sizes = ['Small', 'Medium', 'Large'].map((size) => ({ value: size.toLowerCase(), label: size }));

export default function ExampleSelectLabelAndPlaceholder() {
  return (
    <Container grid={{ columns: { base: 1, md: 3 }, gap: 16 }}>
      <Select label="Label only" options={sizes} />
      <Select label="Label and placeholder" placeholder="Pick a size" options={sizes} />
      <Select placeholder="Placeholder only" aria-label="Size" options={sizes} />
    </Container>
  );
}
