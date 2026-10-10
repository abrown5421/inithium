import { Container } from '@inithium/shared-ui-components';
import { Avatar } from '@inithium/shared-ui-composites';

export default function ExampleAvatarBasic() {
  return (
    <Container flex={{ gap: 12, align: 'center' }}>
      <Avatar name="Ada Lovelace" label="Ada Lovelace" defaultValue={{ style: 'initials', seed: 'ada' }} />
      <Avatar name="Grace Hopper" label="Grace Hopper" defaultValue={{ style: 'initials', seed: 'grace' }} />
      <Avatar name="Alan Turing" label="Alan Turing" defaultValue={{ style: 'initials', seed: 'alan' }} />
      <Avatar label="Robot" defaultValue={{ style: 'bottts', seed: 'robot' }} />
    </Container>
  );
}
