import { Text } from '@inithium/shared-ui-components';
import { Tabs } from '@inithium/shared-ui-composites';

export default function ExampleTabsBasic() {
  return (
    <Tabs
      aria-label="Project"
      tabs={[
        { value: 'overview', label: 'Overview', content: <Text>Everything about the project at a glance.</Text> },
        { value: 'activity', label: 'Activity', content: <Text>Who changed what, and when.</Text> },
        { value: 'settings', label: 'Settings', content: <Text>Names, members and permissions.</Text> },
      ]}
    />
  );
}
