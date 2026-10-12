import { Container, Text } from '@inithium/shared-ui-components';
import { PolyBanner } from '@inithium/shared-ui-composites';
import { FullWidthLayout } from '@inithium/shared-ui-layouts';

export default function ExampleFullWidthLayoutHero() {
  return (
    <Container height={420} flex={{ direction: 'column' }} borderWidth={{ all: 1 }} borderColor={{ color: 'surface', intensity: 500, opacity: 30 }}>
      <FullWidthLayout footer={{ links: [{ label: 'Home', href: '#home' }], copyright: 'Studio', onNavigate: () => undefined }}>
        <PolyBanner height={160} />
        <Container padding={{ x: 24, y: 24 }}>
          <Text as="p">The banner runs edge to edge; the page adds its own padding below it.</Text>
        </Container>
      </FullWidthLayout>
    </Container>
  );
}
