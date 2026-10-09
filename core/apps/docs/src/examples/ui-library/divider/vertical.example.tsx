import { Button, Container, Divider, Text } from '@inithium/shared-ui-components';

export default function ExampleDividerVertical() {
  return (
    <Container flex={{ direction: 'column', gap: 20 }}>
      {/* Between buttons in a toolbar: stretches to the row's height. */}
      <Container flex={{ align: 'center', gap: 4 }}>
        <Button variant="ghost" leadingIcon="bold" aria-label="Bold" padding={{ x: 6 }} />
        <Button variant="ghost" leadingIcon="italic" aria-label="Italic" padding={{ x: 6 }} />
        <Divider orientation="vertical" margin={{ x: 4 }} decorative />
        <Button variant="ghost" leadingIcon="align-left" aria-label="Align left" padding={{ x: 6 }} />
        <Button variant="ghost" leadingIcon="align-center" aria-label="Align centre" padding={{ x: 6 }} />
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
