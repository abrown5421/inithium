import { Text } from '@inithium/shared-ui-components';
import { Tabs } from '@inithium/shared-ui-composites';

export default function ExampleTabsButtons() {
  return (
    <Tabs
      variant="buttons"
      aria-label="Account"
      tabs={[
        { value: 'profile', label: 'Profile', icon: 'user', content: <Text>The active tab is a filled Button.</Text> },
        { value: 'orders', label: 'Orders', icon: 'package', content: <Text>The others are ghost Buttons.</Text> },
        { value: 'addresses', label: 'Addresses', icon: 'map-pin', content: <Text>Arrow keys move between them.</Text> },
        { value: 'billing', label: 'Billing', icon: 'credit-card', disabled: true, content: null },
      ]}
    />
  );
}
