import { Container, Select } from '@inithium/shared-ui-components';

const hours = Array.from({ length: 24 }, (_, hour) => {
  const label = `${String(hour).padStart(2, '0')}:00`;
  return { value: label, label };
});

export default function ExampleSelectLongList() {
  return (
    <Container maxWidth={240}>
      <Select label="Send at" leadingIcon="clock" defaultValue="09:00" options={hours} />
    </Container>
  );
}
