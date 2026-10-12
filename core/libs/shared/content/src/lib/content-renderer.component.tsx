import type { ContentDocument, ContentSection } from '@inithium/shared-contracts';
import { sectionLayouts } from '@inithium/shared-contracts';
import { Container } from '@inithium/shared-ui-components';
import { PolyBanner } from '@inithium/shared-ui-composites';
import { ContentBlockView } from './content-block.component';
import { ContentLinksProvider, type ContentLinks } from './content-links.context';

const ALIGN = { start: 'start', center: 'center', end: 'end', stretch: 'stretch' } as const;

export type ContentRendererProps = {
  /** The content to draw: a content page's published version (or, in the CMS, its draft). */
  content: ContentDocument;
  /** Resolves links to the site's pages and follows them through the app's router. */
  links: ContentLinks;
};

/**
 * Draws a content page's sections, columns and blocks (decision 0093) with the UI library's components. `web`'s
 * content template and the CMS editor's preview both use it, so a preview always matches the site.
 */
export function ContentRenderer({ content, links }: ContentRendererProps) {
  return (
    <ContentLinksProvider links={links}>
      <Container flex={{ direction: 'column' }} width="full">
        {content.sections.map((section) => (
          <ContentSectionView key={section.id} section={section} />
        ))}
      </Container>
    </ContentLinksProvider>
  );
}

/** One section: its background, then its columns side by side, stacked below its breakpoint. */
export function ContentSectionView({ section }: { section: ContentSection }) {
  const stackBelow = section.stackBelow ?? 'md';
  const ratios = sectionLayouts[section.layout];
  const vertical = ALIGN[section.verticalAlign ?? 'start'];

  return (
    <Container
      as="section"
      id={section.anchor}
      position={{ type: 'relative' }}
      overflow={{ all: 'hidden' }}
      flex={{ direction: 'column', align: 'center' }}
      width="full"
      padding={{ y: section.padding?.y ?? 48, x: section.padding?.x ?? 24 }}
      bgColor={section.bgColor}
      textColor={section.textColor}
      animation={section.entrance ? { entrance: section.entrance } : undefined}
    >
      {section.banner && (
        <Container position={{ type: 'absolute', all: 0 }} aria-hidden="true">
          <PolyBanner value={section.banner} height="full" />
        </Container>
      )}
      <Container
        position={{ type: 'relative' }}
        width="full"
        maxWidth={section.maxWidth}
        flex={{
          direction: { base: 'column', [stackBelow]: 'row' },
          align: { base: 'stretch', [stackBelow]: vertical },
          gap: section.gap ?? 32,
        }}
      >
        {section.columns.map((column, index) => (
          <Container
            key={column.id}
            flex={{ direction: 'column', gap: 20 }}
            flexItem={{ grow: { base: 0, [stackBelow]: ratios[index] ?? 1 }, basis: { base: 'auto', [stackBelow]: 0 } }}
            minWidth={0}
          >
            {column.blocks.map((block) => (
              <ContentBlockView key={block.id} block={block} stackBelow={stackBelow} />
            ))}
          </Container>
        ))}
      </Container>
    </Container>
  );
}
