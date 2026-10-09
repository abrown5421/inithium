import { Button, Container, Tooltip } from '@inithium/shared-ui-components';

const sides = ['top', 'right', 'bottom', 'left'] as const;

export default function ExampleTooltipPlacement() {
  return (
    <Container flex={{ wrap: 'wrap', gap: 12 }} padding={{ y: 32 }}>
      {sides.map((side) => (
        <Tooltip key={side} content={`On the ${side}`} side={side}>
          <Button variant="ghost">{side}</Button>
        </Tooltip>
      ))}
      <Tooltip content="Lined up with the start" side="bottom" align="start">
        <Button variant="ghost">bottom, start</Button>
      </Tooltip>
    </Container>
  );
}
