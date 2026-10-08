import { Container, Loader, Text } from '@inithium/shared-ui-components';

const variants = ['spinner', 'dots', 'bars', 'pulse', 'ring', 'orbit', 'wave', 'grid', 'segments'] as const;

export default function ExampleLoaderVariants() {
  return (
    <Container flex={{ direction: 'column', gap: 24 }}>
      <Container flex={{ wrap: 'wrap', gap: 32 }}>
        {variants.map((variant) => (
          <Container key={variant} flex={{ direction: 'column', align: 'center', gap: 8 }}>
            <Loader variant={variant} />
            <Text as="span" fontSize={12}>{variant}</Text>
          </Container>
        ))}
      </Container>
      <Container flex={{ direction: 'column', gap: 8 }}>
        <Loader variant="progress" />
        <Text as="span" fontSize={12}>progress</Text>
      </Container>
    </Container>
  );
}
