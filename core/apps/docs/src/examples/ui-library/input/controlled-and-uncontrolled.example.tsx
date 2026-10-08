import { useRef, useState } from 'react';
import { Button, Container, Input, Text } from '@inithium/shared-ui-components';

export default function ExampleInputControlledAndUncontrolled() {
  const [name, setName] = useState('Ada');
  const cityRef = useRef<HTMLInputElement>(null);
  const [city, setCity] = useState('');

  return (
    <Container grid={{ columns: { base: 1, md: 2 }, gap: 24 }}>
      <Container flex={{ direction: 'column', gap: 8 }}>
        <Input label="Name (controlled)" value={name} onValueChange={setName} />
        <Text fontSize={14}>Hello, {name || 'stranger'}.</Text>
      </Container>
      <Container flex={{ direction: 'column', gap: 8 }}>
        <Input label="City (uncontrolled)" defaultValue="Lisbon" ref={cityRef} />
        <Container flex={{ align: 'center', gap: 12 }}>
          <Button variant="outlined" onClick={() => setCity(cityRef.current?.value ?? '')}>Read value</Button>
          <Text as="span" fontSize={14}>{city}</Text>
        </Container>
      </Container>
    </Container>
  );
}
