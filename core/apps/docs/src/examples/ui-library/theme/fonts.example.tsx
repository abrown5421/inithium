import { Container, Text } from '@inithium/shared-ui-components';

export default function ExampleFonts() {
  return (
    <Container flex={{ direction: 'column', gap: 8 }}>
      <Text fontFamily="display" fontSize={32} textColor="quaternary">
        Display: Bruno Ace SC
      </Text>
      {([300, 400, 500, 600, 700, 800] as const).map((weight) => (
        <Text key={weight} fontWeight={weight} fontSize={17} textColor={{ color: 'surface', intensity: 900 }}>
          Body {weight}: The quick brown fox jumps over the lazy dog.
        </Text>
      ))}
    </Container>
  );
}
