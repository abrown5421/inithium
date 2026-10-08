import { Text } from '@inithium/shared-ui-components';

export default function ExampleHoverText() {
  return (
    <a href="/pricing">
      <Text as="span" textColor={{ base: { color: 'surface', intensity: 600 }, hover: { color: 'primary', intensity: 600 } }}>
        See pricing
      </Text>
    </a>
  );
}
