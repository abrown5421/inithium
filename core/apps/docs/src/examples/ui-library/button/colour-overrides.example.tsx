import { Button, Container } from '@inithium/shared-ui-components';

export default function ExampleButtonOverrides() {
  return (
    <Container flex={{ align: 'center', wrap: 'wrap', gap: 12 }}>
      {/* Keep the filled look on hover, darkening instead of emptying. */}
      <Button bgColor={{ hover: { color: 'primary', intensity: 700 } }} borderColor={{ hover: { color: 'primary', intensity: 700 } }} textColor={{ hover: { color: 'primary', intensity: 100 } }}>
        Darken on hover
      </Button>
      {/* Dark text on a light colour. */}
      <Button color={{ color: 'amber', intensity: 300 }} textColor={{ color: 'amber', intensity: 900 }}>
        Light amber
      </Button>
      {/* A tinted ghost hover in the button's own colour. */}
      <Button variant="ghost" color="emerald" bgColor={{ hover: { color: 'emerald', intensity: 100 } }}>
        Tinted ghost
      </Button>
    </Container>
  );
}
