import { Button, Container, Divider, Text, Tooltip } from '@inithium/shared-ui-components';

const tool = (icon: 'bold' | 'italic' | 'align-left' | 'align-center', label: string) => (
  <Tooltip content={label} side="bottom">
    <Button variant="ghost" leadingIcon={icon} aria-label={label} padding={{ x: 6 }} />
  </Tooltip>
);

export default function ExampleDividerVertical() {
  return (
    <Container flex={{ direction: 'column', gap: 20 }}>
      {/* Between buttons in a toolbar: stretches to the row's height. */}
      <Container flex={{ align: 'center', gap: 4 }}>
        {tool('bold', 'Bold')}
        {tool('italic', 'Italic')}
        <Divider orientation="vertical" margin={{ x: 4 }} decorative />
        {tool('align-left', 'Align left')}
        {tool('align-center', 'Align centre')}
      </Container>
      {/* Inline in text: 1em tall. */}
      <Text fontSize={14}>
        Docs <Divider orientation="vertical" margin={{ x: 8 }} decorative /> Blog{' '}
        <Divider orientation="vertical" margin={{ x: 8 }} decorative /> Pricing
      </Text>
      {/* A vertical label. */}
      <Container flex={{ gap: 16 }} height={120}>
        <Text fontSize={14}>Sign in</Text>
        <Divider orientation="vertical" label="or" />
        <Text fontSize={14}>Create an account</Text>
      </Container>
    </Container>
  );
}
