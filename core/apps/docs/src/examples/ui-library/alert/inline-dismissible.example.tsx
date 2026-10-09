import { useState } from 'react';
import { Button, Container } from '@inithium/shared-ui-components';
import { Alert } from '@inithium/shared-ui-composites';

export default function ExampleAlertInlineDismissible() {
  const [shown, setShown] = useState(true);
  return (
    <Container flex={{ direction: 'column', align: 'start', gap: 12 }}>
      <Alert
        show={shown}
        animation={{ entrance: { name: 'fadeIn' }, exit: { name: 'fadeOut', speed: 'faster' } }}
        role="status"
        icon="sparkles"
        title="Welcome to the editor"
        message="Drag sections from the left to build your page."
        action={{ label: 'Take the tour', onClick: () => setShown(false) }}
        onDismiss={() => setShown(false)}
      />
      {!shown && <Button variant="ghost" onClick={() => setShown(true)}>Show it again</Button>}
    </Container>
  );
}
