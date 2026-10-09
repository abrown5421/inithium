import { Container, RadioGroup } from '@inithium/shared-ui-components';

export default function ExampleRadioGroupVerticalCards() {
  return (
    <Container maxWidth={420}>
      <RadioGroup
        label="Payment method"
        variant="card"
        color="emerald"
        defaultValue="card"
        options={[
          { value: 'card', label: 'Card', helperText: 'Visa, Mastercard or American Express', icon: 'credit-card' },
          { value: 'bank', label: 'Bank transfer', helperText: 'Takes 1–2 working days', icon: 'landmark' },
          { value: 'invoice', label: 'Invoice', helperText: 'Business accounts only', icon: 'file-text', disabled: true },
        ]}
      />
    </Container>
  );
}
