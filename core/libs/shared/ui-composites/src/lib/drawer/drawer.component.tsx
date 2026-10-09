import type { ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import type { Animation, DrawerSerializableProps, DrawerSide } from '@inithium/shared-contracts';
import { Button, Container, Text, type ContainerProps } from '@inithium/shared-ui-components';
import { DEFAULT_OVERLAY_COLOR, DialogFrame } from '../dialog/dialog-frame.component';

/** Default width of a left or right drawer, px. */
const DEFAULT_SIZE = 400;
/** On narrow screens, this much overlay stays visible beside a left or right drawer, px. */
const OVERLAY_STRIP = 48;
const CORNER = 12;
const DIVIDER = { color: 'surface', intensity: 500, opacity: 40 } as const;

/** Each side's default animation: in from its edge, back out to it. */
const SIDE_ANIMATION: Record<DrawerSide, Animation> = {
  right: { entrance: { name: 'slideInRight', speed: 'fast' }, exit: { name: 'slideOutRight', speed: 'fast' } },
  left: { entrance: { name: 'slideInLeft', speed: 'fast' }, exit: { name: 'slideOutLeft', speed: 'fast' } },
  top: { entrance: { name: 'slideInDown', speed: 'fast' }, exit: { name: 'slideOutUp', speed: 'fast' } },
  bottom: { entrance: { name: 'slideInUp', speed: 'fast' }, exit: { name: 'slideOutDown', speed: 'fast' } },
};

/** Puts the panel against its edge, leaving a strip of overlay on the far side of a left or right drawer. */
const PLACEMENT: Record<DrawerSide, Omit<ContainerProps, 'children'>> = {
  right: { flex: { justify: 'end' }, padding: { left: OVERLAY_STRIP } },
  left: { flex: { justify: 'start' }, padding: { right: OVERLAY_STRIP } },
  top: { flex: { direction: 'column', justify: 'start' } },
  bottom: { flex: { direction: 'column', justify: 'end' } },
};

/** Only the corners away from the screen edge are rounded. */
const RADIUS: Record<DrawerSide, ContainerProps['radius']> = {
  right: { topLeft: CORNER, bottomLeft: CORNER },
  left: { topRight: CORNER, bottomRight: CORNER },
  top: { bottomLeft: CORNER, bottomRight: CORNER },
  bottom: { topLeft: CORNER, topRight: CORNER },
};

export type DrawerProps = Omit<DrawerSerializableProps, 'title'> & {
  /** Whether the drawer is open. */
  open: boolean;
  /** Called with false when the user closes it (overlay, Escape or ✕). */
  onOpenChange: (open: boolean) => void;
  /** The drawer's heading, and its name for screen readers. */
  title: ReactNode;
  /** The body: anything. It scrolls between the header and the footer. */
  children?: ReactNode;
  /** Pinned under the body, e.g. Cancel and Save buttons. */
  footer?: ReactNode;
};

/**
 * A panel that slides in from a screen edge over the page (decisions 0065 and 0071): the same dialog as Modal
 * (overlay, focus trap, Escape, focus return, global state through `useModal`), with a pinned header (title,
 * description, ✕), a scrolling body and an optional pinned footer. The panel takes Container's style props.
 */
export function Drawer({
  open,
  onOpenChange,
  title,
  description,
  hideTitle = false,
  side = 'right',
  size,
  dismissible = true,
  closeButton = true,
  overlayColor = DEFAULT_OVERLAY_COLOR,
  animation,
  children,
  footer,
  ...panelProps
}: DrawerProps) {
  const horizontal = side === 'left' || side === 'right';
  const showHeader = !hideTitle || Boolean(description) || closeButton;

  return (
    <DialogFrame
      open={open}
      onOpenChange={onOpenChange}
      dismissible={dismissible}
      overlayColor={overlayColor}
      hasDescription={Boolean(description)}
      placement={PLACEMENT[side]}
      renderPanel={({ show, onExitEnd }) => (
        <Container
          flex={{ direction: 'column' }}
          overflow={{ all: 'hidden' }}
          radius={RADIUS[side]}
          bgColor={{ color: 'surface', intensity: 50 }}
          shadow="xl"
          // Left and right: a fixed width, full height. Top and bottom: full width, fitting the content up to 80%.
          {...(horizontal
            ? { width: size ?? DEFAULT_SIZE, maxWidth: 'full' as const }
            : { width: 'full' as const, height: size, maxHeight: '4/5' as const })}
          {...panelProps}
          show={show}
          animation={animation ?? SIDE_ANIMATION[side]}
          onExitEnd={onExitEnd}
        >
          {hideTitle && (
            <Dialog.Title asChild>
              <VisuallyHidden.Root>{title}</VisuallyHidden.Root>
            </Dialog.Title>
          )}
          {showHeader && (
            <Container
              flex={{ align: 'start', gap: 12 }}
              flexItem={{ shrink: 0 }}
              padding={{ x: 24, top: 20, bottom: 16 }}
              borderWidth={{ bottom: hideTitle && !description ? 0 : 1 }}
              borderColor={DIVIDER}
            >
              <Container flex={{ direction: 'column', gap: 4 }} flexItem={{ grow: 1 }} minWidth={0}>
                {!hideTitle && (
                  <Dialog.Title asChild>
                    <Text as="h2" fontSize={18} fontWeight={700}>
                      {title}
                    </Text>
                  </Dialog.Title>
                )}
                {description && (
                  <Dialog.Description asChild>
                    <Text fontSize={14} textColor={{ color: 'surface', intensity: 600 }}>
                      {description}
                    </Text>
                  </Dialog.Description>
                )}
              </Container>
              {closeButton && (
                <Dialog.Close asChild>
                  <Button variant="ghost" color={{ color: 'surface', intensity: 700 }} leadingIcon="x" aria-label="Close" padding={{ x: 6 }} />
                </Dialog.Close>
              )}
            </Container>
          )}
          <Container flexItem={{ grow: 1 }} minHeight={0} overflow={{ y: 'auto' }} padding={{ all: 24 }}>
            {children}
          </Container>
          {footer && (
            <Container flexItem={{ shrink: 0 }} padding={{ x: 24, y: 16 }} borderWidth={{ top: 1 }} borderColor={DIVIDER}>
              {footer}
            </Container>
          )}
        </Container>
      )}
    />
  );
}
