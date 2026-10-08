import { useState } from 'react';
import { Button, Container, Icon } from '@inithium/shared-ui-components';

export default function ExampleBell() {
  const [count, setCount] = useState(0);
  return (
    <Container flex={{ align: 'center', gap: 12 }}>
      <Icon name="bell" label={`${count} notifications`} animation={{ attention: { name: 'swing' } }} replay={count} />
      <Button variant="outlined" onClick={() => setCount((value) => value + 1)}>
        New message ({count})
      </Button>
    </Container>
  );
}
