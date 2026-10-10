import { Container, Text } from '@inithium/shared-ui-components';
import { Avatar, PolyBanner } from '@inithium/shared-ui-composites';

export default function ExampleAvatarProfileHeader() {
  return (
    <Container flex={{ direction: 'column' }}>
      <PolyBanner
        editable
        height={140}
        radius={{ top: 12 }}
        defaultValue={{
          cellSize: 80,
          variance: 0.75,
          xColors: [
            { color: 'primary', intensity: 300 },
            { color: 'secondary', intensity: 700 },
          ],
          seed: 'header',
        }}
      />
      <Container position={{ type: 'relative' }} flex={{ align: 'end', gap: 16 }} padding={{ x: 24 }} margin={{ top: -48 }}>
        <Container padding={{ all: 4 }} radius={{ all: 999 }} bgColor={{ color: 'surface', intensity: 50 }}>
          <Avatar editable name="Ada Lovelace" label="Ada Lovelace" width={96} height={96} defaultValue={{ style: 'initials', seed: 'header' }} />
        </Container>
        <Text as="h3" fontSize={20} fontWeight={700} margin={{ bottom: 8 }}>
          Ada Lovelace
        </Text>
      </Container>
    </Container>
  );
}
