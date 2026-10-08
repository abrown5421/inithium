import { themeColors } from '@inithium/shared-contracts';
import { Container, Text } from '@inithium/shared-ui-components';
import { GalleryPage, GallerySection } from './gallery-section.component';

const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

function Swatch({ color, step }: { color: (typeof themeColors)[number]; step: (typeof steps)[number] }) {
  return (
    <Container flex={{ direction: 'column', gap: 4 }} width={{ base: 48, md: 64 }}>
      <Container
        height={48}
        radius={{ all: 6 }}
        bgColor={{ color, intensity: step }}
        borderWidth={{ all: 1 }}
        borderColor={{ color: 'surface', intensity: 500, opacity: 30 }}
      />
      <Text as="span" fontSize={11} align="center" textColor={{ color: 'surface', intensity: 700 }}>
        {step}
      </Text>
    </Container>
  );
}

export function ThemePage() {
  return (
    <GalleryPage title="Theme" intro="The six colour tokens with their generated scales, surface roles and the two theme fonts.">
      <GallerySection title="Scales" description="Brand tokens are set by their 500, surface by its 100; every other step is generated.">
        {themeColors.map((color) => (
          <Container key={color} flex={{ direction: { base: 'column', md: 'row' }, gap: { base: 8, md: 16 } }}>
            <Text as="span" width={120} fontWeight={600} textColor={{ color: 'surface', intensity: 800 }}>
              {color}
            </Text>
            <Container flex={{ wrap: 'wrap', gap: 8 }}>
              {steps.map((step) => (
                <Swatch key={step} color={color} step={step} />
              ))}
            </Container>
          </Container>
        ))}
      </GallerySection>

      <GallerySection title="Surface roles" description="Backgrounds 50–400, borders 500, text 600–950. Every text step is readable on every background step.">
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
      </GallerySection>

      <GallerySection title="Fonts">
        <Text fontFamily="display" fontSize={36} textColor="quaternary">
          Display: Bruno Ace SC
        </Text>
        {([300, 400, 500, 600, 700, 800] as const).map((weight) => (
          <Text key={weight} fontWeight={weight} fontSize={18} textColor={{ color: 'surface', intensity: 900 }}>
            Body {weight}: The quick brown fox jumps over the lazy dog.
          </Text>
        ))}
      </GallerySection>
    </GalleryPage>
  );
}
