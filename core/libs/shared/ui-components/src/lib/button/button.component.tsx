import { useImperativeHandle, type AnimationEvent, type ButtonHTMLAttributes, type CSSProperties, type ReactNode, type Ref } from 'react';
import { buttonStylePropsSchema, type ButtonSerializableProps, type ButtonStyleProps } from '@inithium/shared-contracts';
import { StaggerChildren } from '../animation/stagger-children.component';
import { useAnimation, type AnimationRuntimeProps } from '../animation/use-animation.hook';
import { Icon, type IconName } from '../icon/icon.component';
import { splitStyleProps } from '../style-props/split-style-props.service';
import { resolveButtonStyles } from '../style-props/style-props.service';

const styleKeys = new Set(Object.keys(buttonStylePropsSchema.shape) as (keyof ButtonStyleProps)[]);

/** Icon size inside a button, in px. */
const BUTTON_ICON_SIZE = 16;

// Fixed behaviour the style props don't express: layout, cursor, transition, the focus outline in the button's
// colour, the disabled look, and the link variant's hover underline.
const baseClasses =
  'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap leading-none cursor-pointer transition-all ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 outline-(--ui-button-accent) ' +
  'disabled:cursor-not-allowed disabled:opacity-50';
const linkClasses = 'enabled:hover:underline underline-offset-2';

export type ButtonProps = Omit<ButtonSerializableProps, 'leadingIcon' | 'trailingIcon'> &
  AnimationRuntimeProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'style' | 'color'> & {
    /** A Lucide icon shown before the content. */
    leadingIcon?: IconName;
    /** A Lucide icon shown after the content. */
    trailingIcon?: IconName;
    children?: ReactNode;
    ref?: Ref<HTMLButtonElement>;
  };

/**
 * A button (decision 0054): a variant (filled, outlined, ghost or link) styled from one colour, with optional
 * colour overrides, leading and trailing icons, spacing, width and animation. Renders a <button type="button">
 * unless `type` says otherwise.
 */
export function Button(props: ButtonProps) {
  const [styleProps, rest] = splitStyleProps(props, styleKeys);
  const {
    children,
    leadingIcon,
    trailingIcon,
    type = 'button',
    animation,
    show,
    replay,
    onEntranceEnd,
    onExitEnd,
    ref,
    onAnimationEnd,
    ...attributes
  } = rest;

  const motion = useAnimation({ animation, show, replay, onEntranceEnd, onExitEnd });
  const { mounted, attach, getElement } = motion;
  // Expose the rendered element through the caller's ref (refreshed after every commit).
  useImperativeHandle(ref, () => getElement() as HTMLButtonElement);
  if (!mounted) return null;

  const { className, style, accent } = resolveButtonStyles(styleProps);
  const handleAnimationEnd = (event: AnimationEvent<HTMLButtonElement>) => {
    motion.handleAnimationEnd(event);
    onAnimationEnd?.(event);
  };

  return (
    <button
      ref={attach}
      type={type}
      className={[baseClasses, styleProps.variant === 'link' && linkClasses, className, motion.className].filter(Boolean).join(' ')}
      style={{ ...style, '--ui-button-accent': accent, ...motion.style } as CSSProperties}
      onAnimationEnd={handleAnimationEnd}
      {...attributes}
    >
      {leadingIcon && <Icon name={leadingIcon} size={BUTTON_ICON_SIZE} />}
      <StaggerChildren>{children}</StaggerChildren>
      {trailingIcon && <Icon name={trailingIcon} size={BUTTON_ICON_SIZE} />}
    </button>
  );
}
