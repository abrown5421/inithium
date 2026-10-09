import { Container, Select } from '@inithium/shared-ui-components';

const fruit = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
];

export default function ExampleSelectVariants() {
  return (
    <Container grid={{ columns: { base: 1, md: 3 }, align: 'end', gap: 16 }}>
      <Select label="Outlined" options={fruit} />
      <Select variant="filled" label="Filled" options={fruit} />
      <Select variant="standard" label="Standard" options={fruit} defaultValue="banana" />
    </Container>
  );
}
