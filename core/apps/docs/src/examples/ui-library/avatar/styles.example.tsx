import { avatarStyles } from '@inithium/shared-contracts';
import { Container, Text } from '@inithium/shared-ui-components';
import { Avatar, avatarStyleName } from '@inithium/shared-ui-composites';

export default function ExampleAvatarStyles() {
  return (
    <Container grid={{ columns: 7, gap: 16 }}>
      {avatarStyles.map((style) => (
        <Container key={style} flex={{ direction: 'column', align: 'center', gap: 6 }}>
          <Avatar width={56} height={56} name="Ada Lovelace" defaultValue={{ style, seed: 'inithium' }} />
          <Text as="span" fontSize={12}>
            {avatarStyleName(style)}
          </Text>
        </Container>
      ))}
    </Container>
  );
}
