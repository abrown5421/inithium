import { Container, Text } from '@inithium/shared-ui-components';
import { GalleryPage, GallerySection } from './gallery-section.component';

const muted = { color: 'surface', intensity: 700 } as const;
const strong = { color: 'surface', intensity: 900 } as const;

export function TextPage() {
  return (
    <GalleryPage title="Text" intro="Headings, paragraphs, inline text and labels, with typography, colour and truncation.">
      <GallerySection title="Heading scale" description="Sizes grow from md. Headings have no built-in size, so each sets fontSize.">
        <Text as="h1" fontFamily="display" fontSize={{ base: 32, md: 44 }} lineHeight={1.1} textColor="primary">Display h1</Text>
        <Text as="h2" fontSize={{ base: 24, md: 30 }} fontWeight={700} textColor={strong}>Section h2</Text>
        <Text as="h3" fontSize={{ base: 19, md: 22 }} fontWeight={600} textColor={strong}>Subsection h3</Text>
      </GallerySection>

      <GallerySection title="Weight, alignment, line height and letter spacing">
        <Container grid={{ columns: { base: 1, md: 3 }, gap: 16 }}>
          <Text align="left" fontWeight={300} textColor={strong}>Left, weight 300</Text>
          <Text align="center" fontWeight={600} textColor={strong}>Centre, weight 600</Text>
          <Text align="right" fontWeight={800} textColor={strong}>Right, weight 800</Text>
        </Container>
        <Text maxWidth={640} lineHeight={1.8} fontSize={17} textColor={muted}>
          A readable paragraph with a line height of 1.8 and a maximum width of 640px, so lines stay a comfortable length even on wide screens.
        </Text>
        <Text letterSpacing={4} fontWeight={700} fontSize={13} textColor="secondary">LETTER SPACING 4PX</Text>
      </GallerySection>

      <GallerySection title="Inline text and a badge">
        <Text textColor={strong}>
          Plans start at <Text as="span" fontWeight={700} textColor="accent">$9</Text> a month.{' '}
          <Text as="span" fontSize={12} fontWeight={700} padding={{ x: 8, y: 2 }} radius={{ all: 999 }} bgColor="accent" textColor={{ color: 'accent', intensity: 950 }}>
            New
          </Text>
        </Text>
      </GallerySection>

      <GallerySection title="Truncation" description="Two lines on mobile, no truncation from md.">
        <Container width={{ base: 'full', md: '1/2' }} padding={{ all: 12 }} borderWidth={{ all: 1 }} borderStyle="dashed" borderColor={{ color: 'surface', intensity: 500 }} radius={{ all: 8 }}>
          <Text truncate={{ base: 2, md: false }} textColor={{ color: 'surface', intensity: 800 }}>
            This sentence is long enough to wrap onto several lines. On a phone it stops after two lines with an ellipsis; from the md breakpoint it shows in full, because truncation is switched off there.
          </Text>
        </Container>
      </GallerySection>

      <GallerySection title="Label">
        <Container flex={{ direction: 'column', gap: 4 }}>
          <Text as="label" htmlFor="gallery-email" fontWeight={600} textColor={strong}>Email</Text>
          <input id="gallery-email" placeholder="Click the label to focus me" />
        </Container>
      </GallerySection>
    </GalleryPage>
  );
}
