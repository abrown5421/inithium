import { headingSizesV1, type Breakpoint, type ContentAlign, type ContentBlock, type ContentVisibility } from '@inithium/shared-contracts';
import { Button, Container, Divider, Icon, Text, type IconName } from '@inithium/shared-ui-components';
import { PolyBanner } from '@inithium/shared-ui-composites';
import { typographyProps } from '../content-typography.service';
import { useContentLinks } from '../content-links.context';
import { RichText } from '../rich-text.component';
import { useContentDecoratorsV1 } from './content-decorators-v1.context';
import { ImageBlockView } from './image-block-v1.component';

/** Each heading level's default size, on phones and from md up (the editor's starting sizes match). */
export const HEADING_SIZES = headingSizesV1;
const JUSTIFY = { start: 'start', center: 'center', end: 'end' } as const;
const ALIGN_ITEMS = { start: 'start', center: 'center', end: 'end' } as const;

/** Hides a block on phones (below the section's stacking breakpoint) or wider screens. */
function hiddenFor(hideOn: ContentVisibility | undefined, stackBelow: Breakpoint) {
  if (!hideOn?.phone && !hideOn?.desktop) return undefined;
  return { base: Boolean(hideOn.phone), [stackBelow]: Boolean(hideOn.desktop) };
}

export type ContentBlockViewProps = {
  block: ContentBlock;
  /** The section's stacking breakpoint, which divides 'phone' from 'desktop'. */
  stackBelow: Breakpoint;
};

/** Draws one content block (decision 0093) with the UI library's components. */
export function ContentBlockView({ block, stackBelow }: ContentBlockViewProps) {
  const decorators = useContentDecoratorsV1();
  const drawn = <BlockBody block={block} />;
  return (
    <Container hidden={hiddenFor(block.hideOn, stackBelow)} minWidth={0} data-block={block.type}>
      {decorators.block ? decorators.block(block, drawn) : drawn}
    </Container>
  );
}

function BlockBody({ block }: { block: ContentBlock }) {
  const resolve = useContentLinks();
  const textAlign = (align: ContentAlign | undefined) => (align ? JUSTIFY[align] : undefined);

  switch (block.type) {
    case 'heading':
      return (
        <Text
          as={`h${block.level}`}
          {...typographyProps(block.typography, { fontFamily: 'display', fontSize: HEADING_SIZES[block.level] })}
          lineHeight={1.2}
          align={textAlign(block.align)}
          textColor={block.textColor}
        >
          {block.text}
        </Text>
      );
    case 'rich-text':
      return <RichText doc={block.doc} align={block.align} textColor={block.textColor} typography={block.typography} />;
    case 'buttons':
      return (
        <Container flex={{ direction: 'row', wrap: 'wrap', gap: 12, justify: block.align ? JUSTIFY[block.align] : 'start' }}>
          {block.buttons.map((button) => {
            const link = resolve(button.link);
            return (
              <Button
                key={button.id}
                variant={button.variant}
                color={button.color}
                leadingIcon={button.icon as IconName | undefined}
                trailingIcon={link.newTab ? 'external-link' : undefined}
                disabled={!link.href}
                onClick={link.follow}
              >
                {button.label}
              </Button>
            );
          })}
        </Container>
      );
    case 'image':
      return <ImageBlockView block={block} />;
    case 'divider':
      return <Divider color={block.color} thickness={block.thickness} lineStyle={block.lineStyle} decorative />;
    case 'spacer':
      return <Container height={block.height} aria-hidden="true" />;
    case 'feature': {
      const center = block.align === 'center';
      return (
        <Container flex={{ direction: 'column', align: center ? 'center' : 'start', gap: 10 }}>
          <Icon name={block.icon as IconName} size={32} textColor={block.iconColor ?? { color: 'primary', intensity: 500 }} />
          <Text
            as="h3"
            {...typographyProps(block.titleTypography, { fontSize: 18, fontWeight: 600 })}
            lineHeight={1.3}
            align={center ? 'center' : undefined}
            textColor={block.titleColor}
          >
            {block.title}
          </Text>
          {block.text && (
            <Text
              as="p"
              {...typographyProps(block.textTypography)}
              lineHeight={1.6}
              align={center ? 'center' : undefined}
              textColor={block.textColor ?? { color: 'surface', intensity: 700 }}
            >
              {block.text}
            </Text>
          )}
        </Container>
      );
    }
    case 'banner': {
      const align = block.align ?? 'center';
      return (
        <PolyBanner value={block.pattern} height={block.height} radius={{ all: 12 }}>
          {(block.heading || block.text) && (
            <Container
              height="full"
              flex={{ direction: 'column', justify: 'center', align: ALIGN_ITEMS[align], gap: 8 }}
              padding={{ all: 24 }}
              textColor={block.textColor ?? { color: 'surface', intensity: 50 }}
            >
              {block.heading && (
                <Text
                  as="h2"
                  {...typographyProps(block.headingTypography, { fontFamily: 'display', fontSize: { base: 28, md: 40 } })}
                  lineHeight={1.15}
                  align={JUSTIFY[align]}
                >
                  {block.heading}
                </Text>
              )}
              {block.text && (
                <Text as="p" {...typographyProps(block.textTypography, { fontSize: { base: 16, md: 18 } })} lineHeight={1.5} align={JUSTIFY[align]}>
                  {block.text}
                </Text>
              )}
            </Container>
          )}
        </PolyBanner>
      );
    }
  }
}
