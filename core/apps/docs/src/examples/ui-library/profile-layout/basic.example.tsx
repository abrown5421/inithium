import { useState } from 'react';
import type { AvatarRecipe, PolyPattern } from '@inithium/shared-contracts';
import { Button, Container, Text } from '@inithium/shared-ui-components';
import { Tabs } from '@inithium/shared-ui-composites';
import { ProfileLayout } from '@inithium/shared-ui-layouts';

export default function ExampleProfileLayoutBasic() {
  const [avatar, setAvatar] = useState<AvatarRecipe>({ style: 'initials', seed: 'ada', backgroundColor: 'primary' });
  const [banner, setBanner] = useState<PolyPattern>({
    cellSize: 90,
    variance: 0.7,
    xColors: [
      { color: 'primary', intensity: 300 },
      { color: 'secondary', intensity: 600 },
      { color: 'accent', intensity: 400 },
    ],
    yColors: [
      { color: 'tertiary', intensity: 200 },
      { color: 'primary', intensity: 800 },
    ],
    seed: 'example',
  });
  return (
    <Container borderWidth={{ all: 1 }} borderColor={{ color: 'surface', intensity: 500, opacity: 30 }}>
      <ProfileLayout
        name="Ada Lovelace"
        avatar={avatar}
        banner={banner}
        onAvatarChange={setAvatar}
        onBannerChange={setBanner}
        actions={<Button variant="outlined" leadingIcon="user-plus">Add friend</Button>}
        sidebar={
          <Text as="p" fontSize={14}>
            Joined October 2026
          </Text>
        }
      >
        <Tabs
          tabs={[
            { value: 'about', label: 'About', icon: 'user', content: <Text as="p">Writes the first programs.</Text> },
            { value: 'posts', label: 'Posts', icon: 'newspaper', content: <Text as="p">No posts yet.</Text> },
          ]}
        />
      </ProfileLayout>
    </Container>
  );
}
