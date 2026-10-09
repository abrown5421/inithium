import { useRef, useState, type MouseEvent, type ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import type { Animation, ColorValue, ModalSerializableProps } from '@inithium/shared-contracts';
import { Button, Container, Text } from '@inithium/shared-ui-components';

/** The overlay: dark in both light and dark mode (decision 0065). */
const OVERLAY_COLOR: ColorValue = { color: 'neutral', intensity: 950, opacity: 60 };
/** The overlay always fades; the panel follows it in, after a short wait. */
const OVERLAY_ANIMATION: Animation = { entrance: { name: 'fadeIn', speed: 'faster' }, exit: { name: 'fadeOut', speed: 'faster' } };
const PANEL_ANIMATION: Animation = {
  entrance: { name: 'fadeInUp', speed: 'fast', delay: 150 },
  exit: { name: 'fadeOutDown', speed: 'fast' },
};
/** Modals sit below popups (z-index 50), so a Select or Tooltip inside one appears above it. */
const MODAL_LAYER = 40;

export type ModalProps = Omit<ModalSerializableProps, 'title'> & {
  /** Whether the modal is open. */
  open: boolean;
  /** Called with false when the user closes it (overlay, Escape or ✕). */
  onOpenChange: (open: boolean) => void;
  /** The modal's heading, and its name for screen readers. */
  title: ReactNode;
  /** Anything: forms, text, images, buttons. */
  children?: ReactNode;
};

/**
 * A dialog over the page (decisions 0056 and 0065): Radix's accessible dialog, with a dark overlay that fades in
 * and a centred panel that animates in (fadeInUp) and out (fadeOutDown), holding any content. Controlled by
 * `open` and `onOpenChange`; connect it to the global modal state with `useModal(id)` from
 * @inithium/shared-data-access. The panel takes Container's style props.
 */
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  hideTitle = false,
  dismissible = true,
  closeButton = true,
  overlayColor = OVERLAY_COLOR,
  animation = PANEL_ANIMATION,
  children,
  ...panelProps
}: ModalProps) {
  // Stays rendered after `open` turns false, until the panel's exit animation ends.
  const [present, setPresent] = useState(open);
  // The element focused when the modal opened (e.g. the button that opened it), to focus again on close.
  const opener = useRef<HTMLElement | null>(null);
  if (open && !present) setPresent(true);
  if (!present) return null;

  const preventUnlessDismissible = (event: Event) => {
    if (!dismissible) event.preventDefault();
  };
  // Clicks on the overlay or around the panel mustn't move focus out of the modal.
  const keepFocus = (event: MouseEvent) => {
    if (event.target === event.currentTarget) event.preventDefault();
  };

  return (
    // Radix stays open until the exit animation ends, so focus stays trapped while the modal animates out.
    <Dialog.Root open onOpenChange={(next) => !next && onOpenChange(false)}>
      <Dialog.Portal>
        <Dialog.Overlay asChild>
          <Container
            position={{ type: 'fixed', all: 0, z: MODAL_LAYER }}
            bgColor={overlayColor}
            show={open}
            animation={OVERLAY_ANIMATION}
            onMouseDown={keepFocus}
          />
        </Dialog.Overlay>
        {/* Centres the panel; clicks here are outside the panel, so they close the modal like the overlay. */}
        <Container
          position={{ type: 'fixed', all: 0, z: MODAL_LAYER }}
          flex={{ align: 'center', justify: 'center' }}
          padding={{ all: 16 }}
          onMouseDown={keepFocus}
        >
          <Dialog.Content
            asChild
            // Without a description, tell Radix there's nothing to describe the dialog.
            {...(description ? {} : { 'aria-describedby': undefined })}
            onEscapeKeyDown={preventUnlessDismissible}
            onPointerDownOutside={preventUnlessDismissible}
            // Radix only returns focus to its own Trigger; modals open from anywhere, so return it ourselves.
            onOpenAutoFocus={() => {
              opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
            }}
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              opener.current?.focus();
            }}
          >
            <Container
              position={{ type: 'relative' }}
              width="full"
              maxWidth={480}
              maxHeight="full"
              overflow={{ y: 'auto' }}
              padding={{ all: 24 }}
              radius={{ all: 12 }}
              bgColor={{ color: 'surface', intensity: 50 }}
              shadow="xl"
              {...panelProps}
              show={open}
              animation={animation}
              onExitEnd={() => setPresent(false)}
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
              {children}
              {closeButton && (
                <Container position={{ type: 'absolute', top: 12, right: 12 }}>
                  <Dialog.Close asChild>
                    <Button
                      variant="ghost"
                      color={{ color: 'surface', intensity: 700 }}
                      leadingIcon="x"
                      aria-label="Close"
                      padding={{ x: 6 }}
                    />
                  </Dialog.Close>
                </Container>
              )}
            </Container>
          </Dialog.Content>
        </Container>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
