import { useState, type FormEvent } from 'react';
import { Button, Checkbox, Container, Text } from '@inithium/shared-ui-components';

export default function ExampleCheckboxInAForm() {
  const [submitted, setSubmitted] = useState('');

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSubmitted(JSON.stringify({ notifications: data.getAll('notifications') }));
  };

  return (
    <form onSubmit={submit}>
      <Container flex={{ direction: 'column', align: 'start', gap: 8 }}>
        <Container flex={{ direction: 'column' }}>
          <Checkbox name="notifications" value="email" label="Email" defaultChecked />
          <Checkbox name="notifications" value="sms" label="Text message" />
          <Checkbox name="notifications" value="push" label="Push notification" />
        </Container>
        <Button type="submit" variant="outlined">Save</Button>
        {submitted && <Text as="span" fontSize={14}>Submitted: {submitted}</Text>}
      </Container>
    </form>
  );
}
