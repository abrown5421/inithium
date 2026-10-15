import type { Breakpoint } from '../../ui/variants.schema';
import type {
  ButtonElement,
  ContainerElement,
  ContainerElementProps,
  ContentBlock,
  ContentDocument,
  ContentDocumentV1,
  ContentElement,
  ContentSection,
  ContentTypography,
  ContentVisibility,
  TextElement,
  TextElementProps,
} from '../content.types';
import type { RichTextDocument } from '../rich-text.schema';
import { headingSizesV1, sectionLayouts } from './content-v1.schema';

/*
 * Upgrades version 1 content (sections, columns and blocks, decision 0093) to version 2 (a tree of elements, decision
 * 0116), drawing the same page. Every id is kept, and new elements get ids made from their source's, so upgrading the
 * same content always gives the same result.
 */

const ALIGN = { start: 'start', center: 'center', end: 'end', stretch: 'stretch' } as const;

/** An id made from another, still within the 40 characters ids allow. */
const derivedId = (base: string, suffix: string) => `${base.slice(0, 39 - suffix.length)}-${suffix}`;

/** The object without its undefined fields, so upgraded content stores only what was set. */
function defined<T extends object>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, field]) => field !== undefined)) as T;
}

const container = (id: string, props: ContainerElementProps, children: ContentElement[] = []): ContainerElement => ({
  id,
  type: 'container',
  props: defined(props),
  children,
});

const text = (id: string, props: TextElementProps): TextElement => ({ id, type: 'text', props: defined(props) });

const docOf = (node: RichTextDocument['content'][number]): RichTextDocument => ({ type: 'doc', content: [node] });

const headingDoc = (level: 1 | 2 | 3 | 4, value: string) => docOf({ type: 'heading', attrs: { level }, content: [{ type: 'text', text: value }] });

const paragraphDoc = (value: string) => docOf({ type: 'paragraph', content: [{ type: 'text', text: value }] });

/** A block's "hide on" as Container's hidden variants: phones are below the section's stacking breakpoint. */
function hiddenFor(hideOn: ContentVisibility | undefined, stackBelow: Breakpoint) {
  if (!hideOn?.phone && !hideOn?.desktop) return undefined;
  return { base: Boolean(hideOn.phone), [stackBelow]: Boolean(hideOn.desktop) };
}

/** Typography with defaults for what it leaves out. */
const withDefaults = (typography: ContentTypography | undefined, defaults: ContentTypography): ContentTypography =>
  defined({ ...defaults, ...defined(typography ?? {}) });

function upgradeBlock(block: ContentBlock, stackBelow: Breakpoint): ContentElement {
  const hidden = hiddenFor(block.hideOn, stackBelow);
  switch (block.type) {
    case 'heading':
      return text(block.id, {
        doc: headingDoc(block.level, block.text),
        align: block.align,
        textColor: block.textColor,
        // Heading blocks were sized apart from rich text's headings; a level 1 heading draws the same either way.
        headingTypography: block.level === 1 ? block.typography : withDefaults(block.typography, { fontSize: headingSizesV1[block.level] }),
        hidden,
      });
    case 'rich-text':
      return text(block.id, {
        doc: block.doc,
        align: block.align,
        textColor: block.textColor,
        typography: block.typography,
        // Rich text drew 8px above a heading even at its start; Text doesn't, so the space moves outside it.
        margin: block.doc.content[0]?.type === 'heading' ? { top: 8 } : undefined,
        hidden,
      });
    case 'buttons':
      return container(
        block.id,
        { flex: { direction: 'row', wrap: 'wrap', gap: 12, justify: block.align ?? 'start' }, hidden },
        block.buttons.map(
          (button): ButtonElement => ({
            id: button.id,
            type: 'button',
            props: defined({ label: button.label, link: button.link, variant: button.variant, color: button.color, leadingIcon: button.icon }),
          }),
        ),
      );
    case 'image':
      return {
        id: block.id,
        type: 'image',
        props: defined({
          assetId: block.assetId,
          alt: block.alt,
          decorative: block.decorative,
          caption: block.caption,
          captionColor: block.captionColor,
          captionTypography: block.captionTypography,
          width: block.width,
          align: block.align,
          radius: block.radius === undefined ? undefined : { all: block.radius },
          link: block.link,
          hidden,
        }),
      };
    case 'divider':
      return { id: block.id, type: 'divider', props: defined({ color: block.color, thickness: block.thickness, lineStyle: block.lineStyle, hidden }) };
    case 'spacer':
      return container(block.id, { height: block.height, hidden });
    case 'feature': {
      const center = block.align === 'center';
      return container(block.id, { flex: { direction: 'column', align: center ? 'center' : 'start', gap: 10 }, hidden }, [
        { id: derivedId(block.id, 'icon'), type: 'icon', props: { name: block.icon, size: 32, textColor: block.iconColor ?? { color: 'primary', intensity: 500 } } },
        text(derivedId(block.id, 'title'), {
          doc: headingDoc(3, block.title),
          align: center ? 'center' : undefined,
          textColor: block.titleColor,
          headingTypography: withDefaults(block.titleTypography, { fontFamily: 'body', fontWeight: 600, fontSize: { base: 18 } }),
        }),
        ...(block.text
          ? [
              text(derivedId(block.id, 'text'), {
                doc: paragraphDoc(block.text),
                align: center ? 'center' : undefined,
                textColor: block.textColor ?? { color: 'surface', intensity: 700 },
                typography: block.textTypography,
              }),
            ]
          : []),
      ]);
    }
    case 'banner': {
      // A pattern can't be drawn until the PolyBanner element exists (decision 0116): its first colour stands in.
      const align = block.align ?? 'center';
      return container(
        block.id,
        {
          height: block.height,
          radius: { all: 12 },
          bgColor: block.pattern.xColors[0],
          flex: { direction: 'column', justify: 'center', align, gap: 8 },
          padding: { all: 24 },
          textColor: block.textColor ?? { color: 'surface', intensity: 50 },
          hidden,
        },
        [
          ...(block.heading
            ? [
                text(derivedId(block.id, 'heading'), {
                  doc: headingDoc(2, block.heading),
                  align,
                  headingTypography: withDefaults(block.headingTypography, { fontFamily: 'display', fontSize: { base: 28, md: 40 } }),
                }),
              ]
            : []),
          ...(block.text
            ? [text(derivedId(block.id, 'text'), { doc: paragraphDoc(block.text), align, typography: withDefaults(block.textTypography, { fontSize: { base: 16, md: 18 } }) })]
            : []),
        ],
      );
    }
  }
}

/**
 * A section as a full-width Container. A single column without a width limit holds its elements itself; otherwise
 * a row Container holds a Container per column, sharing the width as the layout did and stacking below its
 * breakpoint.
 */
function upgradeSection(section: ContentSection): ContainerElement {
  const stackBelow = section.stackBelow ?? 'md';
  const blocks = (index: number) => (section.columns[index]?.blocks ?? []).map((block) => upgradeBlock(block, stackBelow));
  const band: ContainerElementProps = {
    as: 'section',
    anchor: section.anchor,
    width: 'full',
    padding: { y: section.padding?.y ?? 48, x: section.padding?.x ?? 24 },
    // A pattern background can't be drawn yet either: its first colour stands in.
    bgColor: section.banner?.xColors[0] ?? section.bgColor,
    textColor: section.textColor,
    animation: section.entrance ? { entrance: section.entrance } : undefined,
  };
  const column = { direction: 'column', gap: 20 } as const;

  if (section.columns.length === 1 && section.maxWidth === undefined) {
    return container(section.id, { ...band, flex: column }, blocks(0));
  }
  const inner =
    section.columns.length === 1
      ? container(derivedId(section.id, 'row'), { width: 'full', maxWidth: section.maxWidth, flex: column }, blocks(0))
      : container(
          derivedId(section.id, 'row'),
          {
            width: 'full',
            maxWidth: section.maxWidth,
            flex: {
              direction: { base: 'column', [stackBelow]: 'row' },
              align: { base: 'stretch', [stackBelow]: ALIGN[section.verticalAlign ?? 'start'] },
              gap: section.gap ?? 32,
            },
          },
          section.columns.map((source, index) =>
            container(
              source.id,
              {
                flex: column,
                flexItem: { grow: { base: 0, [stackBelow]: sectionLayouts[section.layout][index] ?? 1 }, basis: { base: 'auto', [stackBelow]: 0 } },
                minWidth: 0,
              },
              blocks(index),
            ),
          ),
        );
  return container(section.id, { ...band, flex: { direction: 'column', align: 'center' } }, [inner]);
}

/** Version 1 content as version 2. The result still needs checking against the current limits. */
export function upgradeContentV1(doc: ContentDocumentV1): ContentDocument {
  return { schemaVersion: 2, elements: doc.sections.map(upgradeSection) };
}
