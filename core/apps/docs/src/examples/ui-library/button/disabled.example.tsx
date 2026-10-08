import { useState } from 'react';
import { Button, Checkbox, Container } from '@inithium/shared-ui-components';

export default function ExampleButtonDisabled() {
  const [agreed, setAgreed] = useState(false);
  return (
    <Container flex={{ direction: 'column', gap: 12 }}>
      <Checkbox label="I accept the terms" checked={agreed} onCheckedChange={(checked) => setAgreed(checked === true)} />
      <Container flex={{ gap: 12 }}>
        <Button disabled={!agreed}>Continue</Button>
        <Button variant="outlined" disabled={!agreed}>Outlined</Button>
        <Button variant="ghost" disabled={!agreed}>Ghost</Button>
        <Button variant="link" disabled={!agreed}>Link</Button>
      </Container>
    </Container>
  );
}
