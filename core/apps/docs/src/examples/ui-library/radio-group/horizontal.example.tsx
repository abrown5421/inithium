import { Container, RadioGroup } from '@inithium/shared-ui-components';

export default function ExampleRadioGroupHorizontal() {
  return (
    <Container flex={{ direction: 'column', gap: 16 }}>
      <RadioGroup
        label="Would you recommend us?"
        orientation="horizontal"
        options={[
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
          { value: 'unsure', label: 'Not sure' },
        ]}
      />
      <RadioGroup
        label="Size"
        orientation="horizontal"
        color="secondary"
        defaultValue="m"
        options={['XS', 'S', 'M', 'L', 'XL'].map((size) => ({ value: size.toLowerCase(), label: size }))}
      />
    </Container>
  );
}
