import { useEffect, useState } from 'react';
import { Button, Container, Loader, Text } from '@inithium/shared-ui-components';

export default function ExampleLoaderLoadingThenContent() {
  const [loading, setLoading] = useState(true);

  // Pretends to fetch for 1.5 seconds.
  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, [loading]);

  return (
    <Container flex={{ direction: 'column', align: 'start', gap: 12 }}>
      <Container flex={{ align: 'center', justify: 'center' }} width={320} minHeight={72} radius={{ all: 8 }} bgColor={{ color: 'surface', intensity: 200 }}>
        {loading ? (
          <Loader variant="dots" label="Loading your profile" />
        ) : (
          <Text animation={{ entrance: { name: 'fadeIn', speed: 'fast' } }}>Ada Lovelace · Analyst</Text>
        )}
      </Container>
      <Button variant="ghost" leadingIcon="refresh-cw" onClick={() => setLoading(true)} disabled={loading}>Reload</Button>
    </Container>
  );
}
