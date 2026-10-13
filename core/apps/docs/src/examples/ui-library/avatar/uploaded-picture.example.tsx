import { useState } from 'react';
import type { AvatarRecipe } from '@inithium/shared-contracts';
import { Container, Text } from '@inithium/shared-ui-components';
import { Avatar } from '@inithium/shared-ui-composites';

// A drawn picture standing in for an upload, so the example needs no file.
const picture =
  'data:image/svg+xml,' +
  encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#e11d48"/><circle cx="100" cy="85" r="45" fill="#fde68a"/></svg>');

export default function ExampleAvatarUploadedPicture() {
  const [recipe, setRecipe] = useState<AvatarRecipe>({ style: 'initials', seed: 'upload-me' });
  const [image, setImage] = useState<{ src: string } | undefined>({ src: picture });

  return (
    <Container flex={{ align: 'center', gap: 16 }}>
      <Avatar
        editable
        name="Ada Lovelace"
        value={recipe}
        // Saving a generated avatar goes back to it, as the profile does.
        onChange={(next) => {
          setRecipe(next);
          setImage(undefined);
        }}
        image={image}
        onUpload={() => setImage({ src: picture })}
        width={96}
        height={96}
      />
      <Text as="p" fontSize={12} textColor={{ color: 'surface', intensity: 700 }}>
        {image ? 'Showing the picture. Edit to go back to the generated avatar.' : 'Generated. Edit, then Upload a picture to show it again.'}
      </Text>
    </Container>
  );
}
