import { useState } from 'react';
import { Button, Container, Text } from '@inithium/shared-ui-components';
import { Tabs } from '@inithium/shared-ui-composites';

const steps = ['details', 'payment', 'review'];

export default function ExampleTabsControlled() {
  const [step, setStep] = useState('details');
  const next = steps[steps.indexOf(step) + 1];

  return (
    <Container flex={{ direction: 'column', align: 'start', gap: 16 }}>
      <Tabs
        value={step}
        onValueChange={setStep}
        aria-label="Checkout"
        tabs={[
          { value: 'details', label: '1. Details', content: <Text>Your name and address.</Text> },
          { value: 'payment', label: '2. Payment', content: <Text>Card or bank transfer.</Text> },
          { value: 'review', label: '3. Review', content: <Text>Check everything, then place the order.</Text> },
        ]}
      />
      <Button disabled={!next} trailingIcon="arrow-right" onClick={() => next && setStep(next)}>
        Next step
      </Button>
    </Container>
  );
}
