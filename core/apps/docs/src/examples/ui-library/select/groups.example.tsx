import { Container, Select } from '@inithium/shared-ui-components';

export default function ExampleSelectGroups() {
  return (
    <Container maxWidth={320}>
      <Select
        label="Office"
        options={[
          { value: 'remote', label: 'Remote' },
          {
            label: 'Europe',
            options: [
              { value: 'lisbon', label: 'Lisbon' },
              { value: 'berlin', label: 'Berlin' },
              { value: 'dublin', label: 'Dublin' },
            ],
          },
          {
            label: 'Americas',
            options: [
              { value: 'toronto', label: 'Toronto' },
              { value: 'austin', label: 'Austin' },
            ],
          },
        ]}
      />
    </Container>
  );
}
