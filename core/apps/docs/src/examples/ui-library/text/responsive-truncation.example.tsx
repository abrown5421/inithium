import { Text } from '@inithium/shared-ui-components';

export default function ExampleTruncate() {
  return (
    <Text truncate={{ base: 2, md: false }} textColor={{ color: 'surface', intensity: 800 }}>
      A long product description that would take several lines on a phone…
    </Text>
  );
}
