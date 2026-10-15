import type { ContentDocument } from '@inithium/shared-contracts';
import { Button, Container, Text } from '@inithium/shared-ui-components';
import { Modal } from '@inithium/shared-ui-composites';
import { elementName, findElement, moveDestinations } from './content-tree.service';

export type MoveToDialogProps = {
  doc: ContentDocument;
  /** The element to move; null closes the dialog. */
  elementId: string | null;
  /** Moves it to the end of a Container, or of the page (null). */
  onMove: (parentId: string | null) => void;
  onClose: () => void;
};

/**
 * "Move to…" (decision 0116): the keyboard's way to move an element into another Container, listing the page and
 * every Container it could go into, nested as in the Layers. It lands at the end of the one chosen.
 */
export function MoveToDialog({ doc, elementId, onMove, onClose }: MoveToDialogProps) {
  const found = elementId ? findElement(doc, elementId) : undefined;
  const current = found?.parent?.id ?? null;
  const destinations = elementId ? moveDestinations(doc, elementId) : [];
  return (
    <Modal
      open={Boolean(found)}
      onOpenChange={(open) => !open && onClose()}
      title={found ? `Move “${elementName(found.element)}” to…` : 'Move to…'}
      description="It goes to the end of the place you choose."
      maxWidth={460}
    >
      <Container as="ul" flex={{ direction: 'column', gap: 2 }} aria-label="Places to move it to">
        {destinations.map((destination) => (
          <Container as="li" key={destination.parentId ?? 'page'} padding={{ left: destination.depth * 16 }}>
            <Button
              variant={destination.parentId === current ? 'filled' : 'ghost'}
              color={destination.parentId === current ? 'primary' : { color: 'surface', intensity: 900 }}
              leadingIcon={destination.parentId === null ? 'file' : 'square-dashed'}
              width="full"
              disabled={destination.parentId === current}
              onClick={() => onMove(destination.parentId)}
            >
              <Text as="span" truncate={1}>
                {destination.label}
                {destination.parentId === current ? ' (where it is now)' : ''}
              </Text>
            </Button>
          </Container>
        ))}
      </Container>
    </Modal>
  );
}
