import { Container } from '@inithium/shared-ui-components';
import { Alert } from '@inithium/shared-ui-composites';

export default function ExampleAlertKinds() {
  return (
    <Container flex={{ direction: 'column', gap: 12 }}>
      <Alert color="emerald" icon="circle-check" title="Saved" message="Your changes are live." />
      <Alert color="red" icon="circle-x" title="Couldn't publish" message="The page has a broken link. Fix it and try again." />
      <Alert color="amber" icon="triangle-alert" title="Storage almost full" message="You've used 92% of your space." />
      <Alert color="sky" icon="info" message="A new version of the editor is available." />
    </Container>
  );
}
