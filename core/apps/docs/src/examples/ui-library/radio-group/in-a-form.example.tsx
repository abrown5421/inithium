import { useState, type FormEvent } from 'react';
import { Button, Container, RadioGroup, Text } from '@inithium/shared-ui-components';

export default function ExampleRadioGroupInAForm() {
  const [submitted, setSubmitted] = useState('');
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(String(new FormData(event.currentTarget).get('theme')));
  };

  return (
    <form onSubmit={submit}>
      <Container flex={{ direction: 'column', align: 'start', gap: 8 }}>
        <RadioGroup
          name="theme"
          label="Theme"
          orientation="horizontal"
          defaultValue="system"
          options={[
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
            { value: 'system', label: 'System' },
          ]}
        />
        <Button type="submit" variant="outlined">Save</Button>
        {submitted && <Text as="span" fontSize={14}>Submitted theme={submitted}</Text>}
      </Container>
    </form>
  );
}
