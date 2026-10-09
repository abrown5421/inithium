import { Button, Container, Input, Select } from '@inithium/shared-ui-components';

export default function ExampleSelectFormRow() {
  return (
    <Container flex={{ align: 'end', gap: 8 }}>
      <Input label="Amount" type="number" defaultValue="100" />
      <Select
        label="Currency"
        defaultValue="eur"
        width={120}
        options={[
          { value: 'eur', label: 'EUR' },
          { value: 'usd', label: 'USD' },
          { value: 'gbp', label: 'GBP' },
        ]}
      />
      <Button>Convert</Button>
    </Container>
  );
}
