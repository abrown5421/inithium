import { themeColors } from '@inithium/shared-contracts';
import { Container, Text } from '@inithium/shared-ui-components';

const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

export default function ExampleScales() {
  return (
    <Container flex={{ direction: 'column', gap: 12 }}>
      {themeColors.map((color) => (
        <Container key={color} flex={{ direction: { base: 'column', md: 'row' }, gap: { base: 6, md: 12 } }}>
          <Text as="span" width={100} fontWeight={600} textColor={{ color: 'surface', intensity: 800 }}>
            {color}
          </Text>
          <Container flex={{ wrap: 'wrap', gap: 6 }}>
            {steps.map((step) => (
              <Container key={step} flex={{ direction: 'column', gap: 2 }} width={44}>
                <Container height={36} radius={{ all: 6 }} bgColor={{ color, intensity: step }} borderWidth={{ all: 1 }} borderColor={{ color: 'surface', intensity: 500, opacity: 30 }} />
                <Text as="span" fontSize={10} align="center" textColor={{ color: 'surface', intensity: 700 }}>
                  {step}
                </Text>
              </Container>
            ))}
          </Container>
        </Container>
      ))}
    </Container>
  );
}
