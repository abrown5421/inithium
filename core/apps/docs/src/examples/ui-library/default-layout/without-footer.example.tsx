import { Container, Text } from '@inithium/shared-ui-components';
import { DefaultLayout } from '@inithium/shared-ui-layouts';

export default function ExampleDefaultLayoutWithoutFooter() {
  return (
    <Container height={200} flex={{ direction: 'column' }} bgColor={{ color: 'primary', intensity: 50 }}>
      <DefaultLayout>
        <Text as="p">No footer: the content area fills the frame.</Text>
      </DefaultLayout>
    </Container>
  );
}
