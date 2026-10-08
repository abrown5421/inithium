import { Container, Icon, Text } from '@inithium/shared-ui-components';
import { CodeBlock } from '../code/code-block.component';
import { findExample } from './examples.service';

/** A live example rendered above its exact source code, like MUI's docs. */
export function ExampleBlock({ path }: { path: string }) {
  const example = findExample(path);

  if (!example) {
    return (
      <Container
        margin={{ y: 16 }}
        padding={{ all: 16 }}
        radius={{ all: 12 }}
        flex={{ align: 'center', gap: 8 }}
        bgColor={{ color: 'rose', intensity: 50 }}
        textColor={{ color: 'rose', intensity: 800 }}
      >
        <Icon name="triangle-alert" size={18} />
        <Text as="span">
          Missing example: core/apps/docs/src/examples/{path}.example.tsx
        </Text>
      </Container>
    );
  }

  const { Component, source } = example;
  return (
    <Container margin={{ y: 16 }}>
      <Container
        padding={{ all: 24 }}
        radius={{ top: 12 }}
        borderWidth={{ all: 1, bottom: 0 }}
        borderColor={{ color: 'surface', intensity: 500, opacity: 40 }}
        bgColor={{ color: 'surface', intensity: 50 }}
      >
        <Component />
      </Container>
      <CodeBlock code={source.trimEnd()} language="tsx" attached />
    </Container>
  );
}
