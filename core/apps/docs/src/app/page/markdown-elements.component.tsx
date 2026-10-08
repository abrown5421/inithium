import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';
import type { Components } from 'react-markdown';
import { Link } from 'react-router-dom';
import { Container, Icon, Text } from '@inithium/shared-ui-components';
import { CodeBlock } from '../code/code-block.component';
import { ExampleBlock } from '../examples/example-block.component';
import { resolveLink, type ManualPage } from '../manual/manual.service';

// Maps Markdown elements to UI library components (decision 0053). Tables and code use small viewer-only elements.

const body = { color: 'surface', intensity: 800 } as const;
const strong = { color: 'surface', intensity: 950 } as const;

const headingSizes = { 1: { base: 30, md: 36 }, 2: { base: 24, md: 26 }, 3: 20, 4: 17, 5: 16, 6: 15 } as const;

type Line = { position?: { start: { line: number } } };

function headingRenderer(page: ManualPage, level: 1 | 2 | 3 | 4 | 5 | 6) {
  return function Heading({ node, children }: { node?: Line; children?: ReactNode }) {
    const id = node?.position ? page.headingIds.get(node.position.start.line) : undefined;
    return (
      <Text
        as={`h${level}`}
        id={id}
        fontFamily={level === 1 ? 'display' : 'body'}
        fontSize={headingSizes[level]}
        fontWeight={level === 1 ? 400 : 700}
        lineHeight={1.25}
        textColor={level === 1 ? 'primary' : strong}
        margin={{ top: level === 1 ? 0 : level === 2 ? 40 : 28, bottom: 12 }}
      >
        {id && level > 1 ? <a href={`#${id}`}>{children}</a> : children}
      </Text>
    );
  };
}

function ManualLink({ page, href, children }: { page: ManualPage; href?: string; children?: ReactNode }) {
  const link = resolveLink(page.file, href ?? '');
  const label = (
    <Text as="span" textColor={{ base: { color: 'primary', intensity: 600 }, hover: { color: 'primary', intensity: 800 } }}>
      {children}
    </Text>
  );
  if (link.kind === 'page') return <Link to={link.to}>{label}</Link>;
  if (link.kind === 'anchor') return <a href={link.to}>{label}</a>;
  if (link.kind === 'external') {
    return (
      <a href={link.to} target="_blank" rel="noreferrer">
        {label} <Icon name="external-link" size={12} textColor={{ color: 'primary', intensity: 600 }} />
      </a>
    );
  }
  return (
    <a href={link.to} title="Open in VS Code">
      {label} <Icon name="file-code" size={12} textColor={{ color: 'primary', intensity: 600 }} />
    </a>
  );
}

function ListItem({ marker, children }: { marker: string; children?: ReactNode }) {
  return (
    <Container as="li" flex={{ gap: 8 }}>
      <Text as="span" textColor={{ color: 'surface', intensity: 600 }} minWidth={16} lineHeight={1.7}>
        {marker}
      </Text>
      <Container flexItem={{ grow: 1 }} minWidth={0}>
        {children}
      </Container>
    </Container>
  );
}

/** Numbers or bullets each item; react-markdown's li doesn't know its index. */
function markList(children: ReactNode, ordered: boolean): ReactNode {
  let index = 0;
  return Children.map(children, (child) => {
    if (!isValidElement(child)) return null; // whitespace between items
    index += 1;
    return <ListItem marker={ordered ? `${index}.` : '•'}>{(child as ReactElement<{ children?: ReactNode }>).props.children}</ListItem>;
  });
}

export function markdownComponents(page: ManualPage): Components {
  return {
    h1: headingRenderer(page, 1),
    h2: headingRenderer(page, 2),
    h3: headingRenderer(page, 3),
    h4: headingRenderer(page, 4),
    h5: headingRenderer(page, 5),
    h6: headingRenderer(page, 6),
    p: ({ children }) => (
      <Text lineHeight={1.7} fontSize={16} textColor={body} margin={{ y: 8 }}>
        {children}
      </Text>
    ),
    strong: ({ children }) => (
      <Text as="span" fontWeight={700} textColor={strong}>
        {children}
      </Text>
    ),
    a: ({ href, children }) => (
      <ManualLink page={page} href={href}>
        {children}
      </ManualLink>
    ),
    ul: ({ children }) => (
      <Container as="ul" flex={{ direction: 'column', gap: 4 }} margin={{ y: 8 }} textColor={body}>
        {markList(children, false)}
      </Container>
    ),
    ol: ({ children }) => (
      <Container as="ol" flex={{ direction: 'column', gap: 4 }} margin={{ y: 8 }} textColor={body}>
        {markList(children, true)}
      </Container>
    ),
    // Items are rebuilt by markList; this only covers stray li elements.
    li: ({ children }) => <ListItem marker="•">{children}</ListItem>,
    blockquote: ({ children }) => (
      <Container
        margin={{ y: 16 }}
        padding={{ x: 16, y: 4 }}
        borderWidth={{ left: 4 }}
        borderColor="primary"
        bgColor={{ color: 'primary', intensity: 50 }}
        radius={{ right: 8 }}
      >
        {children}
      </Container>
    ),
    hr: () => (
      <Container margin={{ y: 32 }} borderWidth={{ top: 1 }} borderColor={{ color: 'surface', intensity: 500, opacity: 40 }} />
    ),
    table: ({ children }) => (
      <Container margin={{ y: 16 }} overflow={{ x: 'auto' }} radius={{ all: 8 }} borderWidth={{ all: 1 }} borderColor={{ color: 'surface', intensity: 500, opacity: 40 }}>
        <table className="docs-table">{children}</table>
      </Container>
    ),
    // Fenced code is rendered by the code renderer below; drop the wrapping <pre>.
    pre: ({ children }) => children,
    code: ({ className, children }) => {
      const language = /language-([\w-]+)/.exec(className ?? '')?.[1];
      const text = String(children ?? '');
      // Fenced blocks have a language or span lines; everything else is inline code.
      if (!language && !text.includes('\n')) return <code className="docs-inline-code">{children}</code>;
      if (language === 'example') return <ExampleBlock path={text.trim()} />;
      return <CodeBlock code={text.replace(/\n$/, '')} language={language} />;
    },
  };
}
