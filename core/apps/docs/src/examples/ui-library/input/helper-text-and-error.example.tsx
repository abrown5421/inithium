import { useState, type FormEvent } from 'react';
import { Button, Container, Input } from '@inithium/shared-ui-components';

export default function ExampleInputValidation() {
  const [email, setEmail] = useState('not-an-email');
  const [error, setError] = useState<string>();

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(/^\S+@\S+\.\S+$/.test(email) ? undefined : 'Enter an email address like name@example.com');
  };

  return (
    <form onSubmit={submit} noValidate>
      <Container flex={{ direction: 'column', gap: 12 }} maxWidth={360}>
        <Input
          label="Email"
          type="email"
          value={email}
          onValueChange={setEmail}
          helperText="We'll send the receipt here."
          error={error}
        />
        <Button type="submit">Validate</Button>
      </Container>
    </form>
  );
}
