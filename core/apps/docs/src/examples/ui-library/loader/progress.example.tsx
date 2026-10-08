import { useEffect, useState } from 'react';
import { Button, Container, Loader, Text } from '@inithium/shared-ui-components';

export default function ExampleLoaderProgress() {
  const [percent, setPercent] = useState<number>();

  // Simulates an upload: 10% every 300ms.
  useEffect(() => {
    if (percent === undefined || percent >= 100) return;
    const timer = setTimeout(() => setPercent((value) => Math.min(100, (value ?? 0) + 10)), 300);
    return () => clearTimeout(timer);
  }, [percent]);

  return (
    <Container flex={{ direction: 'column', gap: 16 }} maxWidth={420}>
      <Container flex={{ direction: 'column', gap: 6 }}>
        <Text as="span" fontSize={14}>Preparing your export…</Text>
        <Loader variant="progress" label="Preparing export" />
      </Container>
      <Container flex={{ direction: 'column', gap: 6 }}>
        <Text as="span" fontSize={14}>Upload: {percent ?? 0}%</Text>
        <Loader variant="progress" value={percent ?? 0} label="Upload progress" color="emerald" />
      </Container>
      <Button variant="outlined" onClick={() => setPercent(0)} loading={percent !== undefined && percent < 100}>
        {percent === 100 ? 'Upload again' : 'Start upload'}
      </Button>
    </Container>
  );
}
