import { useState } from 'react';
import { Container, Icon, Text } from '@inithium/shared-ui-components';

export default function ExampleUnread() {
  const [unread, setUnread] = useState(true);
  return (
    <Container flex={{ align: 'center', gap: 12 }}>
      <Container role="button" tabIndex={0} onClick={() => setUnread((value) => !value)} padding={{ x: 12, y: 6 }} radius={{ all: 6 }} bgColor={{ color: 'surface', intensity: 200 }}>
        <Text as="span">Toggle unread</Text>
      </Container>
      {unread && <Icon name="mail" label="Unread messages" textColor="accent" />}
    </Container>
  );
}
