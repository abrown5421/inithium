import { Text } from '@inithium/shared-ui-components';

export default function ExampleInline() {
  return (
    <Text textColor={{ color: 'surface', intensity: 900 }}>
      Plans start at <Text as="span" fontWeight={700} textColor="accent">$9</Text> a month.{' '}
      <Text as="span" fontSize={12} fontWeight={700} padding={{ x: 8, y: 2 }} radius={{ all: 999 }} bgColor="accent" textColor={{ color: 'accent', intensity: 950 }}>
        New
      </Text>
    </Text>
  );
}
