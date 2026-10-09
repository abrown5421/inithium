import { useRef, useState, type MouseEvent, type ReactElement } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import type { Animation, ColorValue } from '@inithium/shared-contracts';
import { Container, type ContainerProps } from '@inithium/shared-ui-components';

/** The overlay: dark in both light and dark mode (decision 0065). */
export const DEFAULT_OVERLAY_COLOR: ColorValue = { color: 'neutral', intensity: 950, opacity: 60 };
/** The overlay always fades. */
const OVERLAY_ANIMATION: Animation = { entrance: { name: 'fadeIn', speed: 'faster' }, exit: { name: 'fadeOut', speed: 'faster' } };
/** Overlays (modals, drawers) sit below popups (z-index 50), so a Select or Tooltip inside one appears above it. */
const OVERLAY_LAYER = 40;

export type DialogFrameProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dismissible: boolean;
  overlayColor: ColorValue;
  /** Whether the panel renders a Dialog.Description; without one, Radix is told there's nothing to describe it. */
  hasDescription: boolean;
  /** Positions the panel over the page. Clicks on it are outside the panel, so they close it like the overlay. */
  placement: Omit<ContainerProps, 'children'>;
  /** The panel: one element that takes a ref and props (e.g. a Container), animating with `show` and `onExitEnd`. */
  renderPanel: (exit: { show: boolean; onExitEnd: () => void }) => ReactElement;
};

/**
 * What Modal and Drawer share (decisions 0065 and 0071): Radix's dialog with a fading overlay, staying open until
 * the panel's exit animation ends (so focus stays trapped while it animates out), optional dismissal by overlay and
 * Escape, and focus returned to whatever opened it, even when opened from elsewhere through Redux.
 */
export function DialogFrame({
  open,
  onOpenChange,
  dismissible,
  overlayColor,
  hasDescription,
  placement,
  renderPanel,
}: DialogFrameProps) {
  // Stays rendered after `open` turns false, until the panel's exit animation ends.
  const [present, setPresent] = useState(open);
  // The element focused when the dialog opened (e.g. the button that opened it), to focus again on close.
  const opener = useRef<HTMLElement | null>(null);
  if (open && !present) setPresent(true);
  if (!present) return null;

  const preventUnlessDismissible = (event: Event) => {
    if (!dismissible) event.preventDefault();
  };
  // Clicks on the overlay or around the panel mustn't move focus out of the dialog.
  const keepFocus = (event: MouseEvent) => {
    if (event.target === event.currentTarget) event.preventDefault();
  };

  return (
    <Dialog.Root open onOpenChange={(next) => !next && onOpenChange(false)}>
      <Dialog.Portal>
        <Dialog.Overlay asChild>
          <Container
            position={{ type: 'fixed', all: 0, z: OVERLAY_LAYER }}
            bgColor={overlayColor}
            show={open}
            animation={OVERLAY_ANIMATION}
            onMouseDown={keepFocus}
          />
        </Dialog.Overlay>
        <Container {...placement} position={{ type: 'fixed', all: 0, z: OVERLAY_LAYER }} onMouseDown={keepFocus}>
          <Dialog.Content
            asChild
            // Without a description, tell Radix there's nothing to describe the dialog.
            {...(hasDescription ? {} : { 'aria-describedby': undefined })}
            onEscapeKeyDown={preventUnlessDismissible}
            onPointerDownOutside={preventUnlessDismissible}
            // Radix only returns focus to its own Trigger; dialogs open from anywhere, so return it ourselves.
            onOpenAutoFocus={() => {
              opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
            }}
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              opener.current?.focus();
            }}
          >
            {renderPanel({ show: open, onExitEnd: () => setPresent(false) })}
          </Dialog.Content>
        </Container>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
