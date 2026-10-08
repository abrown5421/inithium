import { useEffect, useState } from 'react';
import { Container, Icon, Text } from '@inithium/shared-ui-components';
import { highlight } from './highlighter.service';

/** Code longer than this many lines starts collapsed behind "Expand code". */
const COLLAPSED_LINES = 14;

function ToolbarButton({ label, icon, onPress }: { label: string; icon: 'copy' | 'check' | 'chevrons-down-up' | 'chevrons-up-down'; onPress: () => void }) {
  return (
    <Container
      as="li"
      role="button"
      tabIndex={0}
      onClick={onPress}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onPress();
        }
      }}
      flex={{ align: 'center', gap: 6 }}
      padding={{ x: 10, y: 4 }}
      radius={{ all: 6 }}
      textColor={{ color: 'surface', intensity: 300 }}
      bgColor={{ base: 'transparent', hover: { color: 'surface', intensity: 50, opacity: 10 } }}
      borderWidth={{ all: 1 }}
      borderColor={{ base: { color: 'surface', intensity: 50, opacity: 15 }, focus: { color: 'accent', intensity: 500 } }}
    >
      <Icon name={icon} size={14} />
      <Text as="span" fontSize={12}>
        {label}
      </Text>
    </Container>
  );
}

/** A highlighted code block with copy and (for long code) expand/collapse. */
export function CodeBlock({ code, language, attached = false }: { code: string; language?: string; attached?: boolean }) {
  const [html, setHtml] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const lines = code.split('\n').length;
  const collapsible = lines > COLLAPSED_LINES;
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let current = true;
    highlight(code, language).then((result) => {
      if (current) setHtml(result);
    });
    return () => {
      current = false;
    };
  }, [code, language]);

  const copy = () => {
    void navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <Container
      bgColor={{ color: 'quaternary', intensity: 950 }}
      radius={attached ? { bottom: 12 } : { all: 12 }}
      overflow={{ all: 'hidden' }}
      margin={{ y: attached ? 0 : 16 }}
    >
      <Container
        as="ul"
        flex={{ justify: 'end', gap: 8 }}
        padding={{ x: 12, y: 8 }}
        borderWidth={{ bottom: 1 }}
        borderColor={{ color: 'surface', intensity: 50, opacity: 10 }}
      >
        {collapsible && (
          <ToolbarButton
            label={expanded ? 'Collapse code' : 'Expand code'}
            icon={expanded ? 'chevrons-down-up' : 'chevrons-up-down'}
            onPress={() => setExpanded((value) => !value)}
          />
        )}
        <ToolbarButton label={copied ? 'Copied' : 'Copy'} icon={copied ? 'check' : 'copy'} onPress={copy} />
      </Container>
      <Container
        position={{ type: 'relative' }}
        maxHeight={collapsible && !expanded ? 320 : 'auto'}
        overflow={{ y: 'hidden', x: 'auto' }}
      >
        {html ? (
          // Shiki's output: trusted HTML generated from the manual's own code.
          <div className="docs-code" dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <pre className="docs-code-plain">{code}</pre>
        )}
      </Container>
    </Container>
  );
}
