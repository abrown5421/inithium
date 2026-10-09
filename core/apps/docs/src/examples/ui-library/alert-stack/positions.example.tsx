import { useState } from 'react';
import { Button, Container, Select } from '@inithium/shared-ui-components';
import { AlertStack, type StackedAlertItem } from '@inithium/shared-ui-composites';
import type { AlertPosition } from '@inithium/shared-contracts';

const positions: AlertPosition[] = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'];

// A stack of its own, with local state instead of Redux, to try each position.
export default function ExampleAlertStackPositions() {
  const [position, setPosition] = useState<AlertPosition>('top-right');
  const [alerts, setAlerts] = useState<StackedAlertItem[]>([]);
  const add = () =>
    setAlerts((current) => [...current, { id: crypto.randomUUID(), open: true, color: 'secondary', icon: 'bell', message: `Shown ${position}` }]);

  return (
    <Container flex={{ align: 'end', gap: 8 }}>
      <Select
        label="Position"
        width={200}
        value={position}
        onValueChange={(value) => setPosition(value as AlertPosition)}
        options={positions.map((value) => ({ value, label: value }))}
      />
      <Button onClick={add}>Show</Button>
      <AlertStack
        position={position}
        alerts={alerts}
        onDismiss={(id) => setAlerts((current) => current.map((alert) => (alert.id === id ? { ...alert, open: false } : alert)))}
        onRemove={(id) => setAlerts((current) => current.filter((alert) => alert.id !== id))}
      />
    </Container>
  );
}
