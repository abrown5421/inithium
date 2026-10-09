import { useState, type FormEvent } from 'react';
import { Button, Container } from '@inithium/shared-ui-components';
import { ColorPicker, type PickedColor } from '@inithium/shared-ui-composites';

export default function ExampleColorPickerValidation() {
  const [banner, setBanner] = useState<PickedColor>();
  const [error, setError] = useState<string>();
  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(banner ? undefined : 'Pick a colour for your banner');
  };

  return (
    <form onSubmit={save} noValidate>
      <Container flex={{ direction: 'column', align: 'start', gap: 12 }} maxWidth={360}>
        <ColorPicker
          label="Banner colour"
          required
          value={banner}
          onValueChange={setBanner}
          helperText="Shown behind your profile name."
          error={error}
        />
        <Button type="submit">Save</Button>
      </Container>
    </form>
  );
}
