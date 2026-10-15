import { Fragment, type MouseEvent, type ReactNode } from 'react';
import type {
  ColorValue,
  ContentAlign,
  ContentLink,
  ContentTypography,
  RichTextDocument,
  RichTextInline,
  RichTextList,
  RichTextNode,
} from '@inithium/shared-contracts';
import { Container, Text, type TextProps } from '@inithium/shared-ui-components';

const HEADING_SIZES = { 2: 26, 3: 21, 4: 18 } as const;
const TEXT_ALIGN = { start: 'start', center: 'center', end: 'end' } as const;

/** A link ready for an anchor: its address (none draws plain text), whether it opens a new tab, and a click handler. */
export type RichTextResolvedLink = { href?: string; newTab: boolean; onClick?: (event: MouseEvent) => void };

/** Links to web addresses as they are. A link to one of the site's pages needs the site's pages, so it draws as text. */
export const resolveUrlLink = (link: ContentLink): RichTextResolvedLink =>
  link.type === 'url' ? { href: link.href, newTab: Boolean(link.newTab) } : { newTab: false };

export type RichTextViewProps = {
  /** The document to draw. */
  doc: RichTextDocument;
  /** Text alignment. Default: the page's (start). */
  align?: ContentAlign;
  /** The text's colour. Default: inherited. */
  textColor?: ColorValue;
  /** Turns each link into an address. Default `resolveUrlLink`: addresses only. Page content passes the site's pages. */
  resolveLink?: (link: ContentLink) => RichTextResolvedLink;
  /** Space between paragraphs, in px. Default 14. */
  gap?: number;
  /** The running text's font, weight and size (decision 0115). Sub-headings keep the display font and their sizes. */
  typography?: ContentTypography;
};

/** Text props for the running text from a block's typography. */
function runningText(typography: ContentTypography | undefined): Pick<TextProps, 'fontFamily' | 'fontWeight' | 'fontSize'> {
  if (!typography) return {};
  const size = typography.fontSize;
  return {
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight,
    fontSize: size ? (size.md === undefined ? size.base : { base: size.base, md: size.md }) : undefined,
  };
}

/**
 * Draws a rich text document (decisions 0093, 0102) with Text and Container: paragraphs, sub-headings (h2–h4),
 * quotes, bulleted and numbered lists, and bold, italic, underlined, linked and restyled text (decision 0115). It
 * never renders HTML from the document, so whatever was saved can't run on the page.
 */
export function RichTextView({ doc, align, textColor, resolveLink = resolveUrlLink, gap = 14, typography }: RichTextViewProps) {
  const base = runningText(typography);
  return (
    <Container flex={{ direction: 'column', gap }} textColor={textColor}>
      {doc.content.map((node, index) => (
        <Fragment key={index}>{renderNode(node, align, resolveLink, base)}</Fragment>
      ))}
    </Container>
  );
}

type Resolve = (link: ContentLink) => RichTextResolvedLink;
type Base = ReturnType<typeof runningText>;

function renderNode(node: RichTextNode, align: ContentAlign | undefined, resolve: Resolve, base: Base): ReactNode {
  const textAlign = align ? TEXT_ALIGN[align] : undefined;
  switch (node.type) {
    case 'paragraph':
      return (
        <Text as="p" lineHeight={1.7} align={textAlign} {...base}>
          {renderInline(node.content, resolve)}
        </Text>
      );
    case 'heading':
      return (
        <Text
          as={`h${node.attrs.level}`}
          fontFamily="display"
          fontSize={HEADING_SIZES[node.attrs.level]}
          lineHeight={1.25}
          align={textAlign}
          margin={{ top: 8 }}
        >
          {renderInline(node.content, resolve)}
        </Text>
      );
    case 'blockquote':
      return (
        <Container
          as="blockquote"
          flex={{ direction: 'column', gap: 10 }}
          padding={{ left: 16, y: 4 }}
          borderWidth={{ left: 4 }}
          borderColor={{ color: 'primary', intensity: 500 }}
        >
          {node.content.map((paragraph, index) => (
            <Text key={index} as="p" lineHeight={1.7} fontStyle="italic" align={textAlign} {...base}>
              {renderInline(paragraph.content, resolve)}
            </Text>
          ))}
        </Container>
      );
    default:
      return renderList(node, resolve, base);
  }
}

/** Lists draw their own markers, since the theme's reset removes the browser's. */
function renderList(list: RichTextList, resolve: Resolve, base: Base): ReactNode {
  const ordered = list.type === 'orderedList';
  const start = ordered ? (list.attrs?.start ?? 1) : 1;
  return (
    <Container as={ordered ? 'ol' : 'ul'} flex={{ direction: 'column', gap: 6 }} padding={{ left: 4 }}>
      {list.content.map((item, index) => (
        <Container as="li" key={index} flex={{ direction: 'row', gap: 10 }}>
          <Text as="span" aria-hidden="true" lineHeight={1.7} minWidth={ordered ? 20 : 10} {...base} fontWeight={ordered ? 600 : base.fontWeight}>
            {ordered ? `${start + index}.` : '•'}
          </Text>
          <Container flex={{ direction: 'column', gap: 6 }} flexItem={{ grow: 1 }} minWidth={0}>
            {item.content.map((child, childIndex) =>
              child.type === 'paragraph' ? (
                <Text key={childIndex} as="p" lineHeight={1.7} {...base}>
                  {renderInline(child.content, resolve)}
                </Text>
              ) : (
                <Fragment key={childIndex}>{renderList(child, resolve, base)}</Fragment>
              ),
            )}
          </Container>
        </Container>
      ))}
    </Container>
  );
}

function renderInline(content: RichTextInline[] | undefined, resolve: Resolve): ReactNode {
  return content?.map((part, index) => {
    if (part.type === 'hardBreak') return <br key={index} />;
    const marks = new Set(part.marks?.map((mark) => mark.type));
    const link = part.marks?.find((mark) => mark.type === 'link');
    const bold = marks.has('bold');
    const italic = marks.has('italic');
    const style = part.marks?.find((mark) => mark.type === 'textStyle')?.attrs;
    // Restyled words sit inside bold, so an explicit weight wins over bold's 700 (decision 0115).
    const restyled = style ? (
      <Text as="span" fontFamily={style.family} fontWeight={style.weight} fontScale={style.size} textColor={style.color}>
        {part.text}
      </Text>
    ) : (
      part.text
    );
    const styled =
      bold || italic || marks.has('underline') ? (
        <Text
          as={bold ? 'strong' : italic ? 'em' : 'span'}
          fontWeight={bold ? 700 : undefined}
          fontStyle={italic ? 'italic' : undefined}
          textDecoration={marks.has('underline') ? 'underline' : undefined}
        >
          {restyled}
        </Text>
      ) : (
        restyled
      );
    return <Fragment key={index}>{link ? <InlineLink link={resolve(link.attrs.link)}>{styled}</InlineLink> : styled}</Fragment>;
  });
}

/**
 * An inline link. A plain <a>: no component renders an inline anchor (decision 0092). A link without an address
 * (e.g. to a page that isn't on the site) shows as plain text.
 */
function InlineLink({ link, children }: { link: RichTextResolvedLink; children: ReactNode }) {
  if (!link.href) return children;
  return (
    <a
      href={link.href}
      onClick={link.onClick}
      {...(link.newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      style={{ color: 'var(--color-primary-600)', textDecoration: 'underline', textUnderlineOffset: 2 }}
    >
      {children}
    </a>
  );
}
