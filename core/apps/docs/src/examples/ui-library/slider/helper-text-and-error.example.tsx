import { useState, type FormEvent } from 'react';
import { Button, Container, Slider } from '@inithium/shared-ui-components';

export default function ExampleSliderValidation() {
  const [seats, setSeats] = useState(1);
  const [error, setError] = useState<string>();

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(seats >= 5 ? undefined : 'Team plans start at 5 seats');
  };

  return (
    <form onSubmit={submit} noValidate>
      <Container flex={{ direction: 'column', align: 'start', gap: 12 }} maxWidth={360}>
        <Slider
          label="Seats"
          max={50}
          value={seats}
          onValueChange={setSeats}
          helperText="You can add more later."
          error={error}
        />
        <Button type="submit">Choose plan</Button>
      </Container>
    </form>
  );
}
