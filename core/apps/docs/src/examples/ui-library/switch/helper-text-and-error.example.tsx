import { useState, type FormEvent } from 'react';
import { Button, Container, Switch } from '@inithium/shared-ui-components';

export default function ExampleSwitchValidation() {
  const [backups, setBackups] = useState(false);
  const [error, setError] = useState<string>();

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(backups ? undefined : 'Backups must be on before you can publish');
  };

  return (
    <form onSubmit={submit} noValidate>
      <Container flex={{ direction: 'column', align: 'start', gap: 8 }}>
        <Switch
          label="Daily backups"
          required
          checked={backups}
          onCheckedChange={setBackups}
          helperText="Keeps 30 days of snapshots."
          error={error}
        />
        <Button type="submit">Publish</Button>
      </Container>
    </form>
  );
}
