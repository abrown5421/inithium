import { useState } from 'react';
import { Button, Container, Text } from '@inithium/shared-ui-components';

export default function ExampleButtonDisabled() {
  const [agreed, setAgreed] = useState(false);
  return (
    <Container flex={{ direction: 'column', gap: 12 }}>
      <Text as="label" fontSize={14}>
        <input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} /> I accept the terms
      </Text>
      <Container flex={{ gap: 12 }}>
        <Button disabled={!agreed}>Continue</Button>
        <Button variant="outlined" disabled={!agreed}>Outlined</Button>
        <Button variant="ghost" disabled={!agreed}>Ghost</Button>
        <Button variant="link" disabled={!agreed}>Link</Button>
      </Container>
    </Container>
  );
}
