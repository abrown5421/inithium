import { useState } from 'react';
import { RadioGroup, Text } from '@inithium/shared-ui-components';

export default function ExampleRadioGroupCards() {
  const [plan, setPlan] = useState('team');
  return (
    <>
      <RadioGroup
        label="Plan"
        variant="card"
        orientation="horizontal"
        value={plan}
        onValueChange={setPlan}
        options={[
          { value: 'starter', label: 'Starter', helperText: '1 site, community support', icon: 'sprout' },
          { value: 'team', label: 'Team', helperText: '10 sites, email support', icon: 'users' },
          { value: 'enterprise', label: 'Enterprise', helperText: 'Unlimited sites, a named contact', icon: 'building-2' },
        ]}
      />
      <Text fontSize={14} margin={{ top: 12 }}>Selected: {plan}</Text>
    </>
  );
}
