import type { ReactNode } from 'react';
import type { Animation, SolidColorValue } from '@inithium/shared-contracts';
import { Button, Container, Icon, Text, type AnimationRuntimeProps, type ContainerProps, type IconName } from '@inithium/shared-ui-components';

/** Text size and line height, px. The leading slot and the ✕ centre on the first line. */
const FONT_SIZE = 14;
const LINE = 20;
/** Size of an image in the leading slot, e.g. a sender's avatar, px. */
const IMAGE_SIZE = 32;

/** The colour's name at a given step, e.g. emerald → emerald-600. */
const shade = (value: SolidColorValue, intensity: 100 | 600): SolidColorValue => ({
  color: typeof value === 'string' ? value : value.color,
  intensity,
});

export type AlertProps = AnimationRuntimeProps & {
  /** The text. */
  message: ReactNode;
  /** A bold line above the message. */
  title?: ReactNode;
  /** Text, border and icon in its 600 step; background in its 100 step. Default 'primary'. */
  color?: SolidColorValue;
  /** A Lucide icon before the text. */
  icon?: IconName;
  /** A round picture before the text instead of the icon, e.g. a sender's avatar. */
  image?: { src: string; alt?: string };
  /** Anything before the text instead of the icon or image, e.g. an Avatar component. */
  leading?: ReactNode;
  /** A link-style button under the message. With only an href, it navigates there. */
  action?: { label: string; href?: string; onClick?: () => void };
  /** Shows an ✕ that calls this. Without it there's no ✕. */
  onDismiss?: () => void;
  animation?: Animation;
  margin?: ContainerProps['margin'];
  /** 'status' or 'alert' for an inline alert that appears while the page is open, so it's announced. */
  role?: 'status' | 'alert';
};

/**
 * A message to the user (decision 0066): an icon, title, message and optional link in one colour, with an ✕.
 * Place it inline on a page, or let an AlertStack show alerts in a corner of the screen.
 */
export function Alert({
  message,
  title,
  color = 'primary',
  icon,
  image,
  leading,
  action,
  onDismiss,
  animation,
  margin,
  role,
  show,
  replay,
  onEntranceEnd,
  onExitEnd,
}: AlertProps) {
  const strong = shade(color, 600);
  const followAction = () => {
    if (action?.onClick) action.onClick();
    else if (action?.href) window.location.assign(action.href);
  };
  const lead =
    leading ??
    (image ? (
      <img
        src={image.src}
        alt={image.alt ?? ''}
        width={IMAGE_SIZE}
        height={IMAGE_SIZE}
        style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      />
    ) : (
      icon && <Icon name={icon} size={20} />
    ));

  return (
    <Container
      role={role}
      flex={{ align: 'start', gap: 12 }}
      width="full"
      maxWidth={360}
      margin={margin}
      padding={{ y: 12, left: 12, right: onDismiss ? 8 : 12 }}
      radius={{ all: 8 }}
      borderWidth={{ all: 2 }}
      borderColor={strong}
      bgColor={shade(color, 100)}
      textColor={strong}
      shadow="lg"
      animation={animation}
      show={show}
      replay={replay}
      onEntranceEnd={onEntranceEnd}
      onExitEnd={onExitEnd}
    >
      {/* A first-line-tall row, so whatever leads is centred on the first line (taller things overflow evenly). */}
      {lead && (
        <Container height={LINE} flex={{ align: 'center', justify: 'center' }} flexItem={{ shrink: 0 }}>
          {lead}
        </Container>
      )}
      <Container flex={{ direction: 'column', gap: 2 }} flexItem={{ grow: 1 }} minWidth={0}>
        {title && (
          <Text as="span" fontSize={FONT_SIZE} lineHeight={LINE / FONT_SIZE} fontWeight={700}>
            {title}
          </Text>
        )}
        <Text as="span" fontSize={FONT_SIZE} lineHeight={LINE / FONT_SIZE}>
          {message}
        </Text>
        {action && (
          <Container margin={{ top: 4 }}>
            <Button variant="link" color={strong} onClick={followAction}>
              {action.label}
            </Button>
          </Container>
        )}
      </Container>
      {onDismiss && (
        <Container height={LINE} flex={{ align: 'center' }} flexItem={{ shrink: 0 }}>
          <Button variant="ghost" color={strong} leadingIcon="x" aria-label="Dismiss" padding={{ x: 6 }} onClick={onDismiss} />
        </Container>
      )}
    </Container>
  );
}
