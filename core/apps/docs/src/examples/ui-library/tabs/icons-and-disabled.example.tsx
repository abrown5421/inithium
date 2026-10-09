import { Text } from '@inithium/shared-ui-components';
import { Tabs } from '@inithium/shared-ui-composites';

export default function ExampleTabsIconsAndDisabled() {
  return (
    <Tabs
      aria-label="Inbox"
      tabs={[
        { value: 'inbox', label: 'Inbox', icon: 'inbox', content: <Text>12 unread messages.</Text> },
        { value: 'sent', label: 'Sent', icon: 'send', content: <Text>Messages you've sent.</Text> },
        { value: 'archive', label: 'Archive', icon: 'archive', disabled: true, content: <Text>Not available on your plan.</Text> },
      ]}
    />
  );
}
