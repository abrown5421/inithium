import { Fragment, type ReactNode } from 'react';
import type {
  ColorValue,
  ContentAlign,
  RichTextDocument,
  RichTextInline,
  RichTextList,
  RichTextNode,
} from '@inithium/shared-contracts';
import { Container, Text } from '@inithium/shared-ui-components';
import { useContentLinks, type ResolvedLink } from './content-links.context';

const HEADING_SIZES = { 2: 26, 3: 21, 4: 18 } as const;
const TEXT_ALIGN = { start: 'start', center: 'center', end: 'end' } as const;

export type RichTextProps = {
  doc: RichTextDocument;
  align?: ContentAlign;
  textColor?: ColorValue;
};

/**
 * Draws a rich text document (decision 0093) with Text and Container: paragraphs, sub-headings (h2–h4), quotes,
 * bulleted and numbered lists, and bold, italic, underlined and linked text. Never renders HTML from the document.
 */
export function RichText({ doc, align, textColor }: RichTextProps) {
  const resolve = useContentLinks();
  return (
    <Container flex={{ direction: 'column', gap: 14 }} textColor={textColor}>
      {doc.content.map((node, index) => (
        <Fragment key={index}>{renderNode(node, align, resolve)}</Fragment>
      ))}
    </Container>
  );
}

type Resolve = ReturnType<typeof useContentLinks>;

function renderNode(node: RichTextNode, align: ContentAlign | undefined, resolve: Resolve): ReactNode {
  const textAlign = align ? TEXT_ALIGN[align] : undefined;
  switch (node.type) {
    case 'paragraph':
      return (
        <Text as="p" lineHeight={1.7} align={textAlign}>
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
            <Text key={index} as="p" lineHeight={1.7} fontStyle="italic" align={textAlign}>
              {renderInline(paragraph.content, resolve)}
            </Text>
          ))}
        </Container>
      );
    default:
      return renderList(node, resolve);
  }
}

/** Lists draw their own markers, since the theme's reset removes the browser's. */
function renderList(list: RichTextList, resolve: Resolve): ReactNode {
  const ordered = list.type === 'orderedList';
  const start = ordered ? (list.attrs?.start ?? 1) : 1;
  return (
    <Container as={ordered ? 'ol' : 'ul'} flex={{ direction: 'column', gap: 6 }} padding={{ left: 4 }}>
      {list.content.map((item, index) => (
        <Container as="li" key={index} flex={{ direction: 'row', gap: 10 }}>
          <Text as="span" aria-hidden="true" lineHeight={1.7} minWidth={ordered ? 20 : 10} fontWeight={ordered ? 600 : undefined}>
            {ordered ? `${start + index}.` : '•'}
          </Text>
          <Container flex={{ direction: 'column', gap: 6 }} flexItem={{ grow: 1 }} minWidth={0}>
            {item.content.map((child, childIndex) =>
              child.type === 'paragraph' ? (
                <Text key={childIndex} as="p" lineHeight={1.7}>
                  {renderInline(child.content, resolve)}
                </Text>
              ) : (
                <Fragment key={childIndex}>{renderList(child, resolve)}</Fragment>
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
    const styled =
      bold || italic || marks.has('underline') ? (
        <Text
          as={bold ? 'strong' : italic ? 'em' : 'span'}
          fontWeight={bold ? 700 : undefined}
          fontStyle={italic ? 'italic' : undefined}
          textDecoration={marks.has('underline') ? 'underline' : undefined}
        >
          {part.text}
        </Text>
      ) : (
        part.text
      );
    return <Fragment key={index}>{link ? <ContentAnchor link={resolve(link.attrs.link)}>{styled}</ContentAnchor> : styled}</Fragment>;
  });
}

/**
 * An inline link. A plain <a>: no component renders an inline anchor (decision 0092). A link to a page that isn't
 * on the site shows as plain text.
 */
function ContentAnchor({ link, children }: { link: ResolvedLink; children: ReactNode }) {
  if (!link.href) return <>{children}</>;
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
