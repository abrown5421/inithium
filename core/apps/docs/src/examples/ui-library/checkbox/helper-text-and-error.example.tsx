import { useState, type FormEvent } from 'react';
import { Button, Checkbox, Container } from '@inithium/shared-ui-components';

export default function ExampleCheckboxValidation() {
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string>();

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(accepted ? undefined : 'You need to accept the terms to continue');
  };

  return (
    <form onSubmit={submit} noValidate>
      <Container flex={{ direction: 'column', align: 'start', gap: 8 }}>
        <Checkbox
          label="I accept the terms of service"
          required
          checked={accepted}
          onCheckedChange={(checked) => setAccepted(checked === true)}
          helperText="You can read them at any time from your account."
          error={error}
        />
        <Button type="submit">Continue</Button>
      </Container>
    </form>
  );
}
