import { Container, Text } from '@inithium/shared-ui-components';
import { Tabs } from '@inithium/shared-ui-composites';

export default function ExampleTabsFill() {
  return (
    <Container maxWidth={420}>
      <Tabs
        fill
        color="secondary"
        aria-label="Sign in or create an account"
        tabs={[
          { value: 'sign-in', label: 'Sign in', content: <Text>Welcome back.</Text> },
          { value: 'register', label: 'Create an account', content: <Text>It takes a minute.</Text> },
        ]}
      />
    </Container>
  );
}
