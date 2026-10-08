import { useState } from 'react';
import { Container, Icon, Text } from '@inithium/shared-ui-components';

export default function ExampleBell() {
  const [count, setCount] = useState(0);
  return (
    <Container flex={{ align: 'center', gap: 12 }}>
      <Icon name="bell" label={`${count} notifications`} animation={{ attention: { name: 'swing' } }} replay={count} />
      <Container role="button" tabIndex={0} onClick={() => setCount((value) => value + 1)} padding={{ x: 12, y: 6 }} radius={{ all: 6 }} bgColor={{ color: 'surface', intensity: 200 }}>
        <Text as="span">New message ({count})</Text>
      </Container>
    </Container>
  );
}
