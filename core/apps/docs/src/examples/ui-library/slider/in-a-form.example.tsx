import { useState, type FormEvent } from 'react';
import { Button, Container, Slider, Text } from '@inithium/shared-ui-components';

export default function ExampleSliderInAForm() {
  const [submitted, setSubmitted] = useState('');
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSubmitted(JSON.stringify({ rating: data.get('rating'), hours: data.getAll('hours[]') }));
  };

  return (
    <form onSubmit={submit}>
      <Container flex={{ direction: 'column', align: 'start', gap: 16 }} maxWidth={360} width="full">
        <Slider name="rating" label="Rating" min={1} max={5} defaultValue={4} marks />
        <Slider name="hours" label="Opening hours" min={6} max={22} defaultValue={[9, 17]} formatValue={(value) => `${value}:00`} />
        <Button type="submit" variant="outlined">Save</Button>
        {submitted && <Text as="span" fontSize={14}>Submitted: {submitted}</Text>}
      </Container>
    </form>
  );
}
