import { useState } from 'react';
import { Button, Container, Divider, Text } from '@inithium/shared-ui-components';

export default function ExampleDividerAnimated() {
  const [more, setMore] = useState(false);
  return (
    <Container flex={{ direction: 'column', align: 'start', gap: 12 }} maxWidth={480}>
      <Button variant="ghost" onClick={() => setMore((value) => !value)}>{more ? 'Show less' : 'Show more'}</Button>
      <Divider label="Advanced" labelAlign="start" show={more} animation={{ entrance: { name: 'fadeIn' }, exit: { name: 'fadeOut', speed: 'fast' } }} />
      <Text fontSize={14} show={more} animation={{ entrance: { name: 'fadeInUp', delay: 150 }, exit: { name: 'fadeOut', speed: 'fast' } }}>
        Custom domains, redirects and API access.
      </Text>
    </Container>
  );
}
