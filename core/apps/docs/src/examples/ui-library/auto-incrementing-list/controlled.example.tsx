import { useState } from 'react';
import { Container, Input, Text } from '@inithium/shared-ui-components';
import { AutoIncrementingList } from '@inithium/shared-ui-composites';

export default function ExampleAutoIncrementingListControlled() {
  const [tags, setTags] = useState(['design', 'react']);
  return (
    <Container flex={{ direction: 'column', gap: 12 }} maxWidth={420}>
      <AutoIncrementingList
        label="Tags"
        itemLabel="tag"
        items={tags}
        onItemsChange={setTags}
        createItem={() => ''}
        renderItem={(tag, index, update) => <Input aria-label={`Tag ${index + 1}`} value={tag} onValueChange={update} />}
      />
      <Text fontSize={14}>tags = {JSON.stringify(tags)}</Text>
    </Container>
  );
}
