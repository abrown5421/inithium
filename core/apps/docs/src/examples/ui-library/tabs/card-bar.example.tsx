import { Container, Text } from '@inithium/shared-ui-components';
import { Tabs } from '@inithium/shared-ui-composites';

const card = { bgColor: { color: 'surface', intensity: 100 }, radius: { all: 12 }, shadow: '2xl' } as const;

export default function ExampleTabsCardBar() {
  return (
    <Container padding={{ all: 24 }} bgColor={{ color: 'surface', intensity: 200 }}>
      <Tabs
        aria-label="Account"
        bar={{ ...card, padding: { x: 12, y: 4 } }}
        tabs={[
          {
            value: 'profile',
            label: 'Profile',
            icon: 'user',
            content: (
              <Container {...card} padding={{ all: 24 }}>
                <Text>Each panel can sit in a matching card.</Text>
              </Container>
            ),
          },
          {
            value: 'orders',
            label: 'Orders',
            icon: 'package',
            content: (
              <Container {...card} padding={{ all: 24 }}>
                <Text>No orders yet.</Text>
              </Container>
            ),
          },
        ]}
      />
    </Container>
  );
}
