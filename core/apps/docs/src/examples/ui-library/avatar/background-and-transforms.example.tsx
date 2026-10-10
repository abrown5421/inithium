import type { AvatarRecipe } from '@inithium/shared-contracts';
import { Container, Text } from '@inithium/shared-ui-components';
import { Avatar } from '@inithium/shared-ui-composites';

const recipes: { caption: string; recipe: AvatarRecipe }[] = [
  { caption: "Style's own", recipe: { style: 'moods', seed: 'mix' } },
  { caption: 'Accent 200', recipe: { style: 'moods', seed: 'mix', backgroundColor: { color: 'accent', intensity: 200 } } },
  { caption: 'None', recipe: { style: 'planets', seed: 'mix', backgroundColor: 'transparent' } },
  { caption: 'Flipped', recipe: { style: 'moods', seed: 'mix', flip: 'horizontal' } },
  { caption: 'Rotated 45°', recipe: { style: 'patchwork', seed: 'mix', rotate: 45 } },
  { caption: 'Scaled 150%', recipe: { style: 'gaze', seed: 'mix', scale: 150 } },
];

export default function ExampleAvatarBackgroundAndTransforms() {
  return (
    <Container flex={{ gap: 16, wrap: 'wrap' }}>
      {recipes.map(({ caption, recipe }) => (
        <Container key={caption} flex={{ direction: 'column', align: 'center', gap: 6 }}>
          <Avatar width={64} height={64} defaultValue={recipe} />
          <Text as="span" fontSize={12}>
            {caption}
          </Text>
        </Container>
      ))}
    </Container>
  );
}
