import { useImperativeHandle, type AnimationEvent, type HTMLAttributes, type Ref } from 'react';
import { DynamicIcon, type IconName } from 'lucide-react/dynamic';
import { iconStylePropsSchema, type IconSerializableProps, type IconStyleProps } from '@inithium/shared-contracts';
import { useAnimation, type AnimationRuntimeProps } from '../animation/use-animation.hook';
import { splitStyleProps } from '../style-props/split-style-props.service';
import { resolveIconStyles } from '../style-props/style-props.service';

const styleKeys = new Set(Object.keys(iconStylePropsSchema.shape) as (keyof IconStyleProps)[]);

export type { IconName };

export type IconProps = Omit<IconSerializableProps, 'name'> &
  AnimationRuntimeProps &
  Omit<HTMLAttributes<HTMLElement>, 'className' | 'style' | 'color' | 'children'> & {
    /** A Lucide icon name, e.g. 'arrow-right' (https://lucide.dev/icons). */
    name: IconName;
    ref?: Ref<HTMLElement>;
  };

/**
 * A Lucide icon (decision 0050). Inherits the surrounding text colour unless textColor is set. Decorative
 * (hidden from screen readers) unless it has a label.
 */
export function Icon(props: IconProps) {
  const [styleProps, rest] = splitStyleProps(props, styleKeys);
  const { name, label, animation, show, replay, onEntranceEnd, onExitEnd, ref, onAnimationEnd, ...attributes } = rest;

  const motion = useAnimation({ animation, show, replay, onEntranceEnd, onExitEnd });
  const { mounted, attach, getElement } = motion;
  // Expose the rendered element through the caller's ref (refreshed after every commit).
  useImperativeHandle(ref, () => getElement() as HTMLElement);
  if (!mounted) return null;

  const { className, style } = resolveIconStyles(styleProps);
  const handleAnimationEnd = (event: AnimationEvent<HTMLElement>) => {
    motion.handleAnimationEnd(event);
    onAnimationEnd?.(event);
  };

  // The span owns the size, style props and animation; the SVG fills it. The icon is fetched on demand, and
  // the span keeps its size while it loads.
  return (
    <span
      ref={attach}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={['inline-flex shrink-0 items-center justify-center align-middle', className, motion.className].filter(Boolean).join(' ')}
      style={{ ...style, ...motion.style }}
      onAnimationEnd={handleAnimationEnd}
      {...attributes}
    >
      <DynamicIcon name={name} size="100%" strokeWidth={styleProps.strokeWidth ?? 2} aria-hidden focusable={false} />
    </span>
  );
}
