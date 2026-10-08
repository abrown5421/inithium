import { Container, Icon, Text, type IconName } from '@inithium/shared-ui-components';
import { GalleryPage, GallerySection } from './gallery-section.component';

const strong = { color: 'surface', intensity: 900 } as const;
const muted = { color: 'surface', intensity: 700 } as const;
const tile = { padding: { all: 12 }, radius: { all: 8 }, bgColor: { color: 'surface', intensity: 50 } } as const;

const sample: IconName[] = ['house', 'search', 'settings', 'user', 'bell', 'mail', 'calendar', 'image', 'trash-2', 'check', 'x', 'arrow-right'];

function Labelled({ caption, children }: { caption: string; children: React.ReactNode }) {
  return (
    <Container {...tile} flex={{ direction: 'column', align: 'center', gap: 8 }} minWidth={96}>
      {children}
      <Text as="span" fontSize={12} textColor={muted}>{caption}</Text>
    </Container>
  );
}

export function IconPage() {
  return (
    <GalleryPage title="Icon" intro="Lucide icons by name. Icons take the surrounding text colour unless textColor is set, and are decorative unless given a label.">
      <GallerySection title="By name" description="Any of Lucide's icons (lucide.dev/icons), loaded on demand.">
        <Container flex={{ wrap: 'wrap', gap: 12 }} textColor={strong}>
          {sample.map((name) => (
            <Labelled key={name} caption={name}>
              <Icon name={name} />
            </Labelled>
          ))}
        </Container>
      </GallerySection>

      <GallerySection title="Size" description="Pixels; default 24. The last one is 20 on mobile and 40 from md.">
        <Container flex={{ wrap: 'wrap', gap: 12, align: 'end' }} textColor={strong}>
          {[16, 24, 32, 48].map((size) => (
            <Labelled key={size} caption={`${size}px`}>
              <Icon name="star" size={size} />
            </Labelled>
          ))}
          <Labelled caption="{ base: 20, md: 40 }">
            <Icon name="star" size={{ base: 20, md: 40 }} />
          </Labelled>
        </Container>
      </GallerySection>

      <GallerySection title="Colour" description="Inherited from the surrounding text; textColor overrides it, including per state.">
        <Container flex={{ wrap: 'wrap', gap: 12 }}>
          <Labelled caption="inherits primary">
            <Text as="span" textColor="primary"><Icon name="heart" /></Text>
          </Labelled>
          <Labelled caption="textColor accent">
            <Text as="span" textColor="primary"><Icon name="heart" textColor="accent" /></Text>
          </Labelled>
          <Labelled caption="hover: rose 500">
            <Icon name="heart" textColor={{ base: { color: 'surface', intensity: 600 }, hover: { color: 'rose', intensity: 500 } }} />
          </Labelled>
        </Container>
      </GallerySection>

      <GallerySection title="Stroke width">
        <Container flex={{ wrap: 'wrap', gap: 12 }} textColor={strong}>
          {[1, 1.5, 2, 3].map((width) => (
            <Labelled key={width} caption={`strokeWidth ${width}`}>
              <Icon name="circle-check" size={32} strokeWidth={width} />
            </Labelled>
          ))}
        </Container>
      </GallerySection>

      <GallerySection title="Inline with text">
        <Text textColor={strong}>
          <Icon name="info" size={18} textColor="primary" /> Icons sit inline and stay centred on the text line.
        </Text>
      </GallerySection>

      <GallerySection title="Chips, using shared style props" description="Icon takes every shared prop: background, padding, radius, border, shadow.">
        <Container flex={{ wrap: 'wrap', gap: 12 }}>
          <Icon name="check" size={20} padding={{ all: 8 }} radius={{ all: 999 }} bgColor={{ color: 'emerald', intensity: 100 }} textColor={{ color: 'emerald', intensity: 700 }} />
          <Icon name="triangle-alert" size={20} padding={{ all: 8 }} radius={{ all: 8 }} bgColor={{ color: 'amber', intensity: 100 }} textColor={{ color: 'amber', intensity: 700 }} />
          <Icon name="x" size={20} padding={{ all: 8 }} radius={{ all: 8 }} borderWidth={{ all: 1 }} borderColor="rose" textColor="rose" shadow="sm" />
        </Container>
      </GallerySection>

      <GallerySection title="Accessibility" description="Decorative by default (hidden from screen readers). With a label, it's announced as an image.">
        <Container flex={{ wrap: 'wrap', gap: 12 }} textColor={strong}>
          <Labelled caption="decorative (aria-hidden)">
            <Icon name="sparkles" />
          </Labelled>
          <Labelled caption='label="Unread messages"'>
            <Icon name="mail" label="Unread messages" />
          </Labelled>
        </Container>
      </GallerySection>

      <GallerySection title="Animation">
        <Container flex={{ wrap: 'wrap', gap: 12 }} textColor={strong}>
          <Labelled caption="attention: heartBeat, infinite">
            <Icon name="heart" textColor="rose" animation={{ attention: { name: 'heartBeat', repeat: 'infinite', speed: 'slow' } }} />
          </Labelled>
          <Labelled caption="entrance: zoomIn">
            <Icon name="rocket" size={32} animation={{ entrance: { name: 'zoomIn', speed: 'fast' } }} />
          </Labelled>
        </Container>
      </GallerySection>

      <GallerySection title="Unknown name" description="A stored name that Lucide doesn't have renders as an empty box of the right size (and logs a console error).">
        <Container flex={{ gap: 12 }} textColor={strong}>
          <Labelled caption="'not-an-icon'">
            <Icon name={'not-an-icon' as IconName} borderWidth={{ all: 1 }} borderStyle="dashed" borderColor={{ color: 'surface', intensity: 500 }} />
          </Labelled>
        </Container>
      </GallerySection>
    </GalleryPage>
  );
}
