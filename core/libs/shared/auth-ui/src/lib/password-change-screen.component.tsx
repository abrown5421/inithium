import { useLogoutMutation } from '@inithium/shared-data-access';
import { Button, Container, Text } from '@inithium/shared-ui-components';
import { BareLayout } from '@inithium/shared-ui-layouts';
import { PasswordChangeForm } from './password-change-form.component';

/**
 * The screen an account sees while it must change its password (decision 0088), in `web` and the CMS alike: a card
 * on a dark backdrop with the PasswordChangeForm, plus a way to sign out. Once changed, the app carries on.
 */
export function PasswordChangeScreen() {
  const [logout] = useLogoutMutation();
  return (
    <Container minHeight="screen" flex={{ direction: 'column' }} bgColor={{ color: 'surface', intensity: 950 }}>
      <BareLayout>
        <PasswordChangeForm
          fullWidthSubmit
          intro={
            <Container flex={{ direction: 'column', gap: 6 }}>
              <Text as="h1" fontFamily="display" fontSize={26}>
                Choose a new password
              </Text>
              <Text as="p" fontSize={14} textColor={{ color: 'surface', intensity: 700 }}>
                Your account was set up with a temporary password. Choose your own before carrying on.
              </Text>
            </Container>
          }
          footer={
            <Button variant="link" color={{ color: 'surface', intensity: 700 }} onClick={() => void logout()}>
              Sign out instead
            </Button>
          }
        />
      </BareLayout>
    </Container>
  );
}
