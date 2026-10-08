import { Icon, Text } from '@inithium/shared-ui-components';

export default function ExampleInlineIcon() {
  return (
    <Text textColor="primary">
      <Icon name="info" size={18} margin={{ right: 6 }} />
      Your changes are saved automatically.
    </Text>
  );
}
