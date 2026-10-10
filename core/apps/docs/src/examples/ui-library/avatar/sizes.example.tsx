import { Container } from '@inithium/shared-ui-components';
import { Avatar } from '@inithium/shared-ui-composites';

export default function ExampleAvatarSizes() {
  return (
    <Container flex={{ gap: 16, align: 'end', wrap: 'wrap' }}>
      {[24, 32, 40, 64, 96, 128].map((size) => (
        <Avatar key={size} editable={size >= 40} width={size} height={size} defaultValue={{ style: 'glass', seed: 'sizes' }} />
      ))}
    </Container>
  );
}
