import { useState, type FormEvent } from 'react';
import { Button, Container, Text } from '@inithium/shared-ui-components';
import { ColorPicker } from '@inithium/shared-ui-composites';

export default function ExampleColorPickerInAForm() {
  const [submitted, setSubmitted] = useState('');
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(String(new FormData(event.currentTarget).get('theme-colour')));
  };

  return (
    <form onSubmit={submit}>
      <Container flex={{ align: 'end', gap: 8, wrap: 'wrap' }}>
        <ColorPicker name="theme-colour" label="Colour" width={240} defaultValue={{ color: 'rose', intensity: 600 }} />
        <Button type="submit" variant="outlined">Save</Button>
        {submitted && <Text as="span" fontSize={14}>Submitted theme-colour={submitted}</Text>}
      </Container>
    </form>
  );
}
