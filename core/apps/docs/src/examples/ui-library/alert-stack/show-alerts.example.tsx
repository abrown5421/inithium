import { Button, Container } from '@inithium/shared-ui-components';
import { useAlerts } from '@inithium/shared-data-access';

export default function ExampleAlertStackShowAlerts() {
  const { show } = useAlerts();
  return (
    <Container flex={{ wrap: 'wrap', gap: 8 }}>
      <Button color="emerald" onClick={() => show({ color: 'emerald', icon: 'circle-check', title: 'Saved', message: 'Your changes are live.' })}>
        Success
      </Button>
      <Button color="red" onClick={() => show({ color: 'red', icon: 'circle-x', title: "Couldn't save", message: 'Check your connection and try again.', urgent: true })}>
        Failure
      </Button>
      <Button color="amber" onClick={() => show({ color: 'amber', icon: 'triangle-alert', message: 'Your session ends in 5 minutes.' })}>
        Warning
      </Button>
      <Button color="sky" onClick={() => show({ color: 'sky', icon: 'info', message: 'Pages now save automatically.' })}>
        Info
      </Button>
    </Container>
  );
}
