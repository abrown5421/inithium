import { Container, RadioGroup } from '@inithium/shared-ui-components';

export default function ExampleRadioGroupDisabled() {
  return (
    <Container grid={{ columns: { base: 1, md: 2 }, gap: 24 }}>
      <RadioGroup
        label="One option disabled"
        defaultValue="monthly"
        options={[
          { value: 'monthly', label: 'Monthly' },
          { value: 'yearly', label: 'Yearly', helperText: 'Not available on your plan', disabled: true },
        ]}
      />
      <RadioGroup
        label="Whole group disabled"
        defaultValue="email"
        disabled
        options={[
          { value: 'email', label: 'Email' },
          { value: 'sms', label: 'Text message' },
        ]}
      />
    </Container>
  );
}
