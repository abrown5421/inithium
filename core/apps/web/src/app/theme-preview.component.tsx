import type { ReactNode } from 'react';
import { themeColors } from '@inithium/shared-contracts';
import { Container, Text } from '@inithium/shared-ui-components';
import { AnimationPreview } from './animation-preview.component';

// Placeholder home page until the page framework exists: shows the theme, the Container/Text props and animation.

const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Container as="section" flex={{ direction: 'column', gap: 16 }} padding={{ y: 32 }}>
      <Text as="h2" fontFamily="display" fontSize={22} textColor={{ color: 'surface', intensity: 900 }}>
        {title}
      </Text>
      {children}
    </Container>
  );
}

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

export function ThemePreview() {
  return (
    <Container as="main" bgColor={{ color: 'surface', intensity: 100 }} minHeight="screen" flex={{ direction: 'column', align: 'center' }}>
      <Container width="full" maxWidth={1120} padding={{ base: { x: 16, y: 32 }, md: { x: 32, y: 48 } }}>
        <Container as="header" flex={{ direction: 'column', gap: 8 }}>
          <Text as="h1" fontFamily="display" fontSize={{ base: 32, md: 48 }} textColor="primary">
            Inithium
          </Text>
          <Text fontSize={18} textColor={{ color: 'surface', intensity: 700 }}>
            Theme preview: every value on this page comes from Container and Text props.
          </Text>
        </Container>

        <Section title="Theme scales">
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
        </Section>

        <Section title="Surface roles">
          <Text textColor={{ color: 'surface', intensity: 700 }}>
            Backgrounds 50–400, borders 500, text 600–950. Every text step is readable on every background step.
          </Text>
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
        </Section>

        <Section title="Fonts">
          <Text fontFamily="display" fontSize={36} textColor="quaternary">
            Display: Bruno Ace SC
          </Text>
          {([300, 400, 500, 600, 700, 800] as const).map((weight) => (
            <Text key={weight} fontWeight={weight} fontSize={18} textColor={{ color: 'surface', intensity: 900 }}>
              Body {weight}: The quick brown fox jumps over the lazy dog.
            </Text>
          ))}
        </Section>

        <Section title="Tailwind colours, shorthand and opacity">
          <Container flex={{ wrap: 'wrap', gap: 12 }}>
            <Container bgColor="emerald" padding={{ x: 16, y: 8 }} radius={{ all: 999 }}>
              <Text as="span" textColor={{ color: 'surface', intensity: 50 }}>bgColor="emerald"</Text>
            </Container>
            <Container bgColor={{ color: 'amber', intensity: 200 }} padding={{ x: 16, y: 8 }} radius={{ all: 999 }}>
              <Text as="span" textColor={{ color: 'amber', intensity: 900 }}>amber 200</Text>
            </Container>
            <Container bgColor={{ color: 'primary', intensity: 500, opacity: 25 }} padding={{ x: 16, y: 8 }} radius={{ all: 999 }}>
              <Text as="span" textColor={{ color: 'primary', intensity: 800 }}>primary 500 at 25%</Text>
            </Container>
          </Container>
        </Section>

        <Section title="States and shadows">
          <Text textColor={{ color: 'surface', intensity: 700 }}>
            Hover the cards. Tab onto the last one to see keyboard focus.
          </Text>
          <Container flex={{ wrap: 'wrap', gap: 16 }}>
            {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
              <Container
                key={size}
                width={160}
                padding={{ all: 16 }}
                radius={{ all: 12 }}
                bgColor={{ base: { color: 'surface', intensity: 50 }, hover: { color: 'primary', intensity: 100 } }}
                shadow={{ base: size, hover: '2xl' }}
              >
                <Text as="span" textColor={{ color: 'surface', intensity: 900 }}>shadow {size}</Text>
              </Container>
            ))}
            <Container
              width={160}
              padding={{ all: 16 }}
              radius={{ all: 12 }}
              bgColor={{ color: 'surface', intensity: 50 }}
              shadow="lg"
              shadowColor={{ color: 'accent', intensity: 500, opacity: 50 }}
            >
              <Text as="span" textColor={{ color: 'surface', intensity: 900 }}>accent shadow</Text>
            </Container>
            <Container
              tabIndex={0}
              width={160}
              padding={{ all: 16 }}
              radius={{ all: 12 }}
              bgColor={{ base: { color: 'surface', intensity: 50 }, focus: { color: 'accent', intensity: 100 } }}
              borderWidth={{ all: 2 }}
              borderColor={{ base: 'transparent', focus: { color: 'accent', intensity: 500 } }}
            >
              <Text as="span" textColor={{ color: 'surface', intensity: 900 }}>focus me</Text>
            </Container>
          </Container>
        </Section>

        <Section title="Layout">
          <Container grid={{ columns: { base: 1, md: 3 }, gap: 12 }}>
            <Container gridItem={{ colSpan: { base: 1, md: 2 } }} bgColor="secondary" padding={{ all: 16 }} radius={{ all: 8 }}>
              <Text textColor={{ color: 'secondary', intensity: 50 }}>Spans 2 of 3 columns from md</Text>
            </Container>
            <Container bgColor="tertiary" padding={{ all: 16 }} radius={{ all: 8 }}>
              <Text textColor={{ color: 'tertiary', intensity: 50 }}>1 column</Text>
            </Container>
            <Container hidden={{ base: true, lg: false }} gridItem={{ colSpan: 'full' }} bgColor="accent" padding={{ all: 16 }} radius={{ all: 8 }}>
              <Text textColor={{ color: 'accent', intensity: 950 }}>Only visible from lg (1024px)</Text>
            </Container>
          </Container>
          <Container width={{ base: 'full', md: '1/2' }} padding={{ all: 12 }} borderWidth={{ all: 1 }} borderStyle="dashed" borderColor={{ color: 'surface', intensity: 500 }} radius={{ all: 8 }}>
            <Text truncate={1} textColor={{ color: 'surface', intensity: 800 }}>
              Truncated to one line: width is full on mobile and half from md, so this long sentence is cut off with an ellipsis instead of wrapping onto a second line.
            </Text>
          </Container>
        </Section>

        <Section title="Animation">
          <AnimationPreview />
        </Section>
      </Container>
    </Container>
  );
}
