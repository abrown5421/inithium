import { Container } from '@inithium/shared-ui-components';
import { AutoIncrementingList, ColorPicker, type PickedColor } from '@inithium/shared-ui-composites';

const newColour = (): PickedColor => ({ color: 'primary', intensity: 500 });

export default function ExampleAutoIncrementingListColourLists() {
  return (
    <Container grid={{ columns: { base: 1, md: 2 }, gap: 24 }}>
      <AutoIncrementingList
        label="X colours"
        itemLabel="colour"
        defaultItems={[{ color: 'quaternary', intensity: 500 } as PickedColor]}
        createItem={newColour}
        renderItem={(colour, index, update) => <ColorPicker aria-label={`X colour ${index + 1}`} value={colour} onValueChange={update} />}
      />
      <AutoIncrementingList
        label="Y colours"
        itemLabel="colour"
        defaultItems={[
          { color: 'accent', intensity: 500 },
          { color: 'tertiary', intensity: 600 },
          { color: 'quaternary', intensity: 800 },
        ] as PickedColor[]}
        createItem={newColour}
        renderItem={(colour, index, update) => <ColorPicker aria-label={`Y colour ${index + 1}`} value={colour} onValueChange={update} />}
      />
    </Container>
  );
}
