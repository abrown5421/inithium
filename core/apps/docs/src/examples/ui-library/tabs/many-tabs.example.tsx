import { Container, Text } from '@inithium/shared-ui-components';
import { Tabs } from '@inithium/shared-ui-composites';

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function ExampleTabsManyTabs() {
  return (
    <Container maxWidth={480}>
      <Tabs
        color="emerald"
        aria-label="Month"
        defaultValue="March"
        tabs={months.map((month) => ({ value: month, label: month, content: <Text>Reports for {month}.</Text> }))}
      />
    </Container>
  );
}
