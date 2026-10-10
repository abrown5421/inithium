import { Container, Text } from '@inithium/shared-ui-components';
import { DefaultLayout } from '@inithium/shared-ui-layouts';

export default function ExampleDefaultLayoutBasic() {
  return (
    <Container height={420} flex={{ direction: 'column' }} borderWidth={{ all: 1 }} borderColor={{ color: 'surface', intensity: 500, opacity: 30 }}>
      <DefaultLayout
        footer={{
          links: [
            { label: 'Home', href: '#home' },
            { label: 'Contact', href: '#contact' },
          ],
          copyright: 'Studio',
          onNavigate: () => undefined,
        }}
      >
        <Text as="h1" fontFamily="display" fontSize={28}>
          A page
        </Text>
        <Text as="p">Short content: the Footer still sits at the bottom.</Text>
      </DefaultLayout>
    </Container>
  );
}
