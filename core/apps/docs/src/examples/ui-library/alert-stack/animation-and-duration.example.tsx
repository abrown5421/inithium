import { Button, Container } from '@inithium/shared-ui-components';
import { useAlerts } from '@inithium/shared-data-access';

export default function ExampleAlertStackAnimationAndDuration() {
  const { show } = useAlerts();
  return (
    <Container flex={{ wrap: 'wrap', gap: 8 }}>
      <Button
        variant="outlined"
        onClick={() =>
          show({
            icon: 'zap',
            message: 'Zooms in, and stays for 10 seconds.',
            duration: 10000,
            animation: { entrance: { name: 'zoomIn', speed: 'faster' }, exit: { name: 'zoomOut', speed: 'faster' } },
          })
        }
      >
        Zoom, 10 seconds
      </Button>
      <Button variant="outlined" color="tertiary" onClick={() => show({ color: 'tertiary', icon: 'pin', message: 'Stays until you dismiss it.', duration: null })}>
        Until dismissed
      </Button>
    </Container>
  );
}
