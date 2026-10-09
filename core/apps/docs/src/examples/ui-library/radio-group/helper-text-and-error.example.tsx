import { useState, type FormEvent } from 'react';
import { Button, Container, RadioGroup } from '@inithium/shared-ui-components';

export default function ExampleRadioGroupValidation() {
  const [reason, setReason] = useState<string>();
  const [error, setError] = useState<string>();

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(reason ? undefined : 'Choose a reason to continue');
  };

  return (
    <form onSubmit={submit} noValidate>
      <Container flex={{ direction: 'column', align: 'start', gap: 8 }}>
        <RadioGroup
          label="Why are you cancelling?"
          required
          value={reason ?? null}
          onValueChange={setReason}
          helperText="This helps us improve."
          error={error}
          options={[
            { value: 'price', label: 'Too expensive' },
            { value: 'features', label: 'Missing features' },
            { value: 'other', label: 'Something else' },
          ]}
        />
        <Button type="submit" color="rose">Cancel subscription</Button>
      </Container>
    </form>
  );
}
