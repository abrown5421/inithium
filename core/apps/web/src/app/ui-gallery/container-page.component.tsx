import { Container, Text } from '@inithium/shared-ui-components';
import { GalleryPage, GallerySection } from './gallery-section.component';

export function ContainerPage() {
  return (
    <GalleryPage title="Container" intro="The general-purpose box: colour, spacing, sizing, borders, shadows, states and layout.">
      <GallerySection title="Colours: tokens, Tailwind, shorthand and opacity">
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
      </GallerySection>

      <GallerySection title="States and shadows" description="Hover the cards. Tab onto the last one to see keyboard focus.">
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
      </GallerySection>

      <GallerySection title="Layout" description="Resize the window: one column on mobile, 2 + 1 from md, and the accent block appears from lg.">
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
      </GallerySection>
    </GalleryPage>
  );
}
