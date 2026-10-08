import { Text } from '@inithium/shared-ui-components';

export default function ExampleBodyCopy() {
  return (
    <Text maxWidth={640} fontSize={18} lineHeight={1.6} textColor={{ color: 'surface', intensity: 800 }}>
      Long-form text reads best at around 60–75 characters per line, with generous line height.
    </Text>
  );
}
