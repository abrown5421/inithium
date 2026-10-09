import { useState, type FormEvent } from 'react';
import { Button, Container, Select } from '@inithium/shared-ui-components';

export default function ExampleSelectValidation() {
  const [role, setRole] = useState('');
  const [error, setError] = useState<string>();

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(role ? undefined : 'Choose a role for this person');
  };

  return (
    <form onSubmit={submit} noValidate>
      <Container flex={{ direction: 'column', gap: 12 }} maxWidth={360}>
        <Select
          label="Role"
          required
          value={role}
          onValueChange={setRole}
          helperText="You can change this later."
          error={error}
          options={[
            { value: 'admin', label: 'Admin' },
            { value: 'editor', label: 'Editor' },
            { value: 'viewer', label: 'Viewer' },
          ]}
        />
        <Button type="submit">Invite</Button>
      </Container>
    </form>
  );
}
