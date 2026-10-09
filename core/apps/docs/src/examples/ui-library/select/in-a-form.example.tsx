import { useState, type FormEvent } from 'react';
import { Button, Container, Select, Text } from '@inithium/shared-ui-components';

export default function ExampleSelectInAForm() {
  const [submitted, setSubmitted] = useState('');
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(String(new FormData(event.currentTarget).get('frequency')));
  };

  return (
    <form onSubmit={submit}>
      <Container flex={{ align: 'end', wrap: 'wrap', gap: 8 }}>
        <Select
          name="frequency"
          label="Digest"
          defaultValue="weekly"
          width={200}
          options={[
            { value: 'daily', label: 'Daily' },
            { value: 'weekly', label: 'Weekly' },
            { value: 'never', label: 'Never' },
          ]}
        />
        <Button type="submit" variant="outlined">Save</Button>
        {submitted && <Text as="span" fontSize={14}>Submitted frequency={submitted}</Text>}
      </Container>
    </form>
  );
}
