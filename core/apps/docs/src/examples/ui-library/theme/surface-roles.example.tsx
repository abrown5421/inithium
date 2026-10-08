import { Container, Text } from '@inithium/shared-ui-components';

export default function ExampleSurfaceRoles() {
  return (
    <Container grid={{ columns: { base: 1, sm: 2, lg: 5 }, gap: 12 }}>
      {([50, 100, 200, 300, 400] as const).map((background) => (
        <Container
          key={background}
          bgColor={{ color: 'surface', intensity: background }}
          borderWidth={{ all: 1 }}
          borderColor={{ color: 'surface', intensity: 500 }}
          radius={{ all: 8 }}
          padding={{ all: 12 }}
          flex={{ direction: 'column', gap: 4 }}
        >
          <Text as="span" fontSize={12} textColor={{ color: 'surface', intensity: 600 }}>
            background {background}
          </Text>
          {([600, 700, 800, 900, 950] as const).map((text) => (
            <Text key={text} as="span" textColor={{ color: 'surface', intensity: text }}>
              Text {text}
            </Text>
          ))}
        </Container>
      ))}
    </Container>
  );
}
