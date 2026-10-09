import { Button, Container, Text, Tooltip } from '@inithium/shared-ui-components';

export default function ExampleTooltipRichContent() {
  return (
    <Tooltip
      content={
        <Container flex={{ align: 'center', gap: 8 }}>
          <Text as="span" fontSize={12}>Search</Text>
          <Text as="span" fontSize={11} padding={{ x: 4 }} radius={{ all: 4 }} borderWidth={{ all: 1 }} borderColor={{ color: 'surface', intensity: 500 }}>
            Ctrl K
          </Text>
        </Container>
      }
    >
      <Button variant="outlined" leadingIcon="search">Search</Button>
    </Tooltip>
  );
}
