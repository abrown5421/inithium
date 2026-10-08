import { useState } from 'react';
import { Button, Container } from '@inithium/shared-ui-components';

export default function ExampleButtonLoading() {
  const [saving, setSaving] = useState(false);
  const save = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 2000);
  };

  return (
    <Container flex={{ align: 'center', wrap: 'wrap', gap: 12 }}>
      <Button loading={saving} onClick={save}>Save changes</Button>
      <Button variant="outlined" leadingIcon="send" loading={saving} onClick={save}>Send</Button>
      <Button variant="ghost" loading={saving} onClick={save}>Ghost</Button>
    </Container>
  );
}
