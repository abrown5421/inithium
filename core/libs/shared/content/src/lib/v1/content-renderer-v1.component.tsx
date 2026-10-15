import type { ContentDocumentV1, ContentSection } from '@inithium/shared-contracts';
import { sectionLayouts } from '@inithium/shared-contracts';
import { Container } from '@inithium/shared-ui-components';
import { PolyBanner } from '@inithium/shared-ui-composites';
import { ContentLinksProvider, type ContentLinks } from '../content-links.context';
import { ContentBlockView } from './content-block-v1.component';
import { ContentDecoratorsV1Provider, useContentDecoratorsV1, type ContentDecoratorsV1 } from './content-decorators-v1.context';

const ALIGN = { start: 'start', center: 'center', end: 'end', stretch: 'stretch' } as const;

export type ContentRendererV1Props = {
  /** Version 1 content: the CMS editor's draft, until the editor edits version 2 (decision 0116). */
  content: ContentDocumentV1;
  /** Resolves links to the site's pages and follows them through the app's router. */
  links: ContentLinks;
  /** Wraps or replaces sections and blocks as they're drawn: for the CMS editor's preview only. */
  decorators?: ContentDecoratorsV1;
};

/**
 * Draws version 1 content's sections, columns and blocks (decision 0093) with the UI library's components. Only the
 * CMS editor's preview uses it now; the site draws version 2 (`ContentRenderer`, decision 0116).
 */
export function ContentRendererV1({ content, links, decorators = NO_DECORATORS }: ContentRendererV1Props) {
  return (
    <ContentLinksProvider links={links}>
      <ContentDecoratorsV1Provider value={decorators}>
        <Container flex={{ direction: 'column' }} width="full">
          {content.sections.map((section) => (
            <DecoratedSection key={section.id} section={section} />
          ))}
        </Container>
      </ContentDecoratorsV1Provider>
    </ContentLinksProvider>
  );
}

const NO_DECORATORS: ContentDecoratorsV1 = {};

function DecoratedSection({ section }: { section: ContentSection }) {
  const decorators = useContentDecoratorsV1();
  const drawn = <ContentSectionView section={section} />;
  return decorators.section ? decorators.section(section, drawn) : drawn;
}

/** One section: its background, then its columns side by side, stacked below its breakpoint. */
export function ContentSectionView({ section }: { section: ContentSection }) {
  const decorators = useContentDecoratorsV1();
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
            {(() => {
              const drawn = column.blocks.map((block) => <ContentBlockView key={block.id} block={block} stackBelow={stackBelow} />);
              return decorators.column ? decorators.column(column, section, drawn) : drawn;
            })()}
          </Container>
        ))}
      </Container>
    </Container>
  );
}
