import { Container, Icon, Text } from '@inithium/shared-ui-components';
import { AutoIncrementingList } from '@inithium/shared-ui-composites';

let next = 3;

export default function ExampleAutoIncrementingListAnyContent() {
  return (
    <Container maxWidth={420}>
      <AutoIncrementingList
        label="Steps"
        itemLabel="step"
        align="center"
        min={2}
        addColor="emerald"
        removeColor={{ color: 'surface', intensity: 600 }}
        defaultItems={[1, 2]}
        createItem={() => next++}
        renderItem={(step) => (
          <Container flex={{ align: 'center', gap: 8 }} padding={{ x: 12, y: 6 }} radius={{ all: 6 }} bgColor={{ color: 'surface', intensity: 200 }}>
            <Icon name="grip-vertical" size={16} textColor={{ color: 'surface', intensity: 500 }} />
            <Text as="span" fontSize={14}>Step {step}</Text>
          </Container>
        )}
      />
    </Container>
  );
}
