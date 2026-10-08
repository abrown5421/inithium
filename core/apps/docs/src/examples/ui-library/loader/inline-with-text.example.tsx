import { Loader, Text } from '@inithium/shared-ui-components';

export default function ExampleLoaderInline() {
  return (
    <Text>
      <Loader size={16} margin={{ right: 8 }} label="Saving" />
      Saving your changes…
    </Text>
  );
}
