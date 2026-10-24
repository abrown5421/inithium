import { useState } from 'react';
import { corePresenceStatuses, presenceLight, type AvatarRecipe } from '@inithium/shared-contracts';
import { Container } from '@inithium/shared-ui-components';
import { Avatar } from '@inithium/shared-ui-composites';

export default function ExampleAvatarStatusLight() {
  const [recipe, setRecipe] = useState<AvatarRecipe>({ style: 'initials', seed: 'status' });

  return (
    <Container flex={{ align: 'center', gap: 24 }}>
      {/* Core's three statuses: hover a light for its name. */}
      {corePresenceStatuses.map((status) => (
        <Avatar key={status.key} name="Ada Lovelace" value={recipe} presence={presenceLight({ status: status.key })} width={56} height={56} />
      ))}
      {/* Editable: the pencil moves to the top-right edge to make room for the light. */}
      <Avatar editable name="Ada Lovelace" value={recipe} onChange={setRecipe} presence={presenceLight({ status: 'active' })} width={96} height={96} />
    </Container>
  );
}
