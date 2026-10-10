import { useState } from 'react';
import type { AvatarRecipe } from '@inithium/shared-contracts';
import { Container, Text } from '@inithium/shared-ui-components';
import { Avatar } from '@inithium/shared-ui-composites';

export default function ExampleAvatarEditable() {
  const [recipe, setRecipe] = useState<AvatarRecipe>({ style: 'initials', seed: 'edit-me' });

  return (
    <Container flex={{ align: 'center', gap: 16 }}>
      <Avatar editable name="Ada Lovelace" value={recipe} onChange={setRecipe} width={96} height={96} />
      <Text as="p" fontSize={12} textColor={{ color: 'surface', intensity: 700 }}>
        Saved recipe: {JSON.stringify(recipe)}
      </Text>
    </Container>
  );
}
