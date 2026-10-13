import type { ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import type { Animation, ModalSerializableProps } from '@inithium/shared-contracts';
import { Button, Container, Text } from '@inithium/shared-ui-components';
import { DEFAULT_OVERLAY_COLOR, DialogFrame } from '../dialog/dialog-frame.component';

/** The panel follows the overlay in, after a short wait. */
const PANEL_ANIMATION: Animation = {
  entrance: { name: 'fadeInUp', speed: 'fast', delay: 150 },
  exit: { name: 'fadeOutDown', speed: 'fast' },
};

export type ModalProps = Omit<ModalSerializableProps, 'title'> & {
  /** Whether the modal is open. */
  open: boolean;
  /** Called with false when the user closes it (overlay, Escape or ✕). */
  onOpenChange: (open: boolean) => void;
  /** The modal's heading, and its name for screen readers. */
  title: ReactNode;
  /** Anything: forms, text, images, buttons. */
  children?: ReactNode;
  /** Pinned under the body, e.g. Cancel and Save buttons. With a footer, the body scrolls between the title and it. */
  footer?: ReactNode;
};

/**
 * A dialog over the page (decisions 0056 and 0065): Radix's accessible dialog, with a dark overlay that fades in
 * and a centred panel that animates in (fadeInUp) and out (fadeOutDown), holding any content. Controlled by
 * `open` and `onOpenChange`; connect it to the global modal state with `useModal(id)` from
 * @inithium/shared-data-access. An optional `footer` stays pinned under a scrolling body. The panel takes Container's
 * style props.
 */
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  hideTitle = false,
  dismissible = true,
  closeButton = true,
  overlayColor = DEFAULT_OVERLAY_COLOR,
  animation = PANEL_ANIMATION,
  children,
  footer,
  ...panelProps
}: ModalProps) {
  return (
    <DialogFrame
      open={open}
      onOpenChange={onOpenChange}
      dismissible={dismissible}
      overlayColor={overlayColor}
      hasDescription={Boolean(description)}
      // Centres the panel.
      placement={{ flex: { align: 'center', justify: 'center' }, padding: { all: 16 } }}
      renderPanel={({ show, onExitEnd }) => (
        <Container
          position={{ type: 'relative' }}
          width="full"
          maxWidth={480}
          maxHeight="full"
          overflow={footer ? { all: 'hidden' } : { y: 'auto' }}
          flex={footer ? { direction: 'column' } : undefined}
          padding={{ all: 24 }}
          radius={{ all: 12 }}
          bgColor={{ color: 'surface', intensity: 50 }}
          shadow="xl"
          {...panelProps}
          show={show}
          animation={animation}
          onExitEnd={onExitEnd}
        >
          <Dialog.Title asChild>
            {hideTitle ? (
              <VisuallyHidden.Root>{title}</VisuallyHidden.Root>
            ) : (
              <Text
                as="h2"
                fontSize={18}
                fontWeight={700}
                margin={{ bottom: description ? 4 : 16 }}
                padding={{ right: closeButton ? 32 : 0 }}
              >
                {title}
              </Text>
            )}
          </Dialog.Title>
          {description && (
            <Dialog.Description asChild>
              <Text fontSize={14} margin={{ bottom: 16 }} textColor={{ color: 'surface', intensity: 600 }}>
                {description}
              </Text>
            </Dialog.Description>
          )}
          {footer ? (
            <>
              {/* The body scrolls; the title above and the footer below stay put. The padding (offset by the margin) keeps floating labels and focus rings from being clipped. */}
              <Container flexItem={{ grow: 1, shrink: 1 }} minHeight={0} overflow={{ y: 'auto' }} margin={{ x: -4, top: -8 }} padding={{ x: 4, top: 8, bottom: 4 }}>
                {children}
              </Container>
              <Container
                flexItem={{ shrink: 0 }}
                margin={{ top: 16, x: -24, bottom: -24 }}
                padding={{ x: 24, y: 16 }}
                borderWidth={{ top: 1 }}
                borderColor={{ color: 'surface', intensity: 500, opacity: 40 }}
              >
                {footer}
              </Container>
            </>
          ) : (
            children
          )}
          {closeButton && (
            <Container position={{ type: 'absolute', top: 12, right: 12 }}>
              <Dialog.Close asChild>
                <Button variant="ghost" color={{ color: 'surface', intensity: 700 }} leadingIcon="x" aria-label="Close" padding={{ x: 6 }} />
              </Dialog.Close>
            </Container>
          )}
        </Container>
      )}
    />
  );
}
