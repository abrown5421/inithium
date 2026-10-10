import { Button, Container, Input, Text } from '@inithium/shared-ui-components';
import { BareLayout } from '@inithium/shared-ui-layouts';

export default function ExampleBareLayoutSignIn() {
  return (
    <Container height={480} flex={{ direction: 'column' }} bgColor={{ color: 'surface', intensity: 100 }}>
      <BareLayout>
        <Container flex={{ direction: 'column', gap: 20 }}>
          <Text as="h1" fontFamily="display" fontSize={26}>
            Login
          </Text>
          <Input label="Email" type="email" />
          <Input label="Password" type="password" />
          <Button width="full">Sign in</Button>
        </Container>
      </BareLayout>
    </Container>
  );
}
