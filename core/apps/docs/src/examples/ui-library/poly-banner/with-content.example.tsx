import { Container, Icon, Text } from '@inithium/shared-ui-components';
import { PolyBanner } from '@inithium/shared-ui-composites';

export default function ExamplePolyBannerWithContent() {
  return (
    <PolyBanner
      editable
      height={160}
      radius={{ all: 12 }}
      label="Profile banner"
      defaultValue={{
        cellSize: 90,
        variance: 0.6,
        xColors: [
          { color: 'surface', intensity: 900 },
          { color: 'accent', intensity: 700 },
        ],
        yColors: [
          { color: 'surface', intensity: 800 },
          { color: 'accent', intensity: 500 },
        ],
        seed: 'profile',
      }}
    >
      <Container height="full" flex={{ align: 'end', gap: 12 }} padding={{ all: 16 }}>
        <Container
          flex={{ align: 'center', justify: 'center' }}
          width={56}
          height={56}
          radius={{ all: 28 }}
          bgColor={{ color: 'surface', intensity: 100 }}
        >
          <Icon name="user" size={28} textColor={{ color: 'surface', intensity: 700 }} />
        </Container>
        <Text as="h3" fontSize={20} fontWeight={700} textColor={{ color: 'surface', intensity: 50 }}>
          Ada Lovelace
        </Text>
      </Container>
    </PolyBanner>
  );
}
