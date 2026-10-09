import { Container, Loader, Text } from '@inithium/shared-ui-components';
import { Alert } from '@inithium/shared-ui-composites';

export default function ExampleAlertCustomLeading() {
  return (
    <Container flex={{ direction: 'column', gap: 12 }}>
      <Alert
        color="violet"
        image={{ src: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#7c3aed"/><text x="16" y="21" font-family="sans-serif" font-size="13" font-weight="700" fill="#fff" text-anchor="middle">GH</text></svg>'), alt: 'Grace Hopper' }}
        title="Grace Hopper"
        message="Commented on your page."
        onDismiss={() => undefined}
      />
      <Alert color="sky" leading={<Loader size={18} color="sky" label="Uploading" />} message="Uploading 3 files…" />
      <Alert
        color="amber"
        leading={
          <Container width={28} height={28} radius={{ all: 6 }} bgColor={{ color: 'amber', intensity: 600 }} flex={{ align: 'center', justify: 'center' }}>
            <Text as="span" fontSize={12} fontWeight={700} textColor={{ color: 'amber', intensity: 50 }}>3</Text>
          </Container>
        }
        title="Pending reviews"
        message="Three pages are waiting for your approval."
        onDismiss={() => undefined}
      />
    </Container>
  );
}
