import { Container, Select } from '@inithium/shared-ui-components';

export default function ExampleSelectRequiredAndDisabled() {
  return (
    <Container grid={{ columns: { base: 1, md: 3 }, align: 'end', gap: 16 }}>
      <Select
        label="Country"
        required
        options={[
          { value: 'pt', label: 'Portugal' },
          { value: 'es', label: 'Spain' },
        ]}
      />
      <Select label="Plan" defaultValue="team" disabled options={[{ value: 'team', label: 'Team' }]} />
      <Select
        variant="filled"
        label="Billing"
        options={[
          { value: 'monthly', label: 'Monthly' },
          { value: 'yearly', label: 'Yearly (not on your plan)', disabled: true },
        ]}
      />
    </Container>
  );
}
