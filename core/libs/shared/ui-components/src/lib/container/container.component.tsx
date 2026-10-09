import { useImperativeHandle, type AnimationEvent, type CSSProperties, type ElementType, type HTMLAttributes, type ReactNode, type Ref } from 'react';
import {
  containerStylePropsSchema,
  type ContainerSerializableProps,
  type ContainerStyleProps,
} from '@inithium/shared-contracts';
import { StaggerChildren } from '../animation/stagger-children.component';
import { useAnimation, type AnimationRuntimeProps } from '../animation/use-animation.hook';
import { splitStyleProps } from '../style-props/split-style-props.service';
import { resolveContainerStyles } from '../style-props/style-props.service';

const styleKeys = new Set(Object.keys(containerStylePropsSchema.shape) as (keyof ContainerStyleProps)[]);

export type ContainerProps = ContainerSerializableProps &
  AnimationRuntimeProps &
  Omit<HTMLAttributes<HTMLElement>, 'className' | 'style' | 'hidden' | 'color'> & {
    children?: ReactNode;
    ref?: Ref<HTMLElement>;
  };

/**
 * A box: layout (flex, grid, position, overflow), spacing, sizing, colour, borders and animation, all through
 * props. With `show={false}` it plays its exit animation, then unmounts.
 */
export function Container(props: ContainerProps) {
  const [styleProps, rest] = splitStyleProps(props, styleKeys);
  const { children, animation, stagger, show, replay, onEntranceEnd, onExitEnd, ref, onAnimationEnd, ...forwarded } = rest;
  // Radix's asChild (used by composites) passes its own style and className to the child; merge them rather
  // than letting them replace the style props.
  const { style: slotStyle, className: slotClassName, ...attributes } = forwarded as typeof forwarded & {
    style?: CSSProperties;
    className?: string;
  };

  const motion = useAnimation({ animation, show, replay, onEntranceEnd, onExitEnd });
  const { mounted, attach, getElement } = motion;
  // Expose the rendered element through the caller's ref (refreshed after every commit).
  useImperativeHandle(ref, () => getElement() as HTMLElement);
  if (!mounted) return null;

  // The allowed tags are constrained by the prop types; ElementType lets one ref type cover them all.
  const Element = (styleProps.as ?? 'div') as ElementType;
  const { className, style } = resolveContainerStyles(styleProps);
  const handleAnimationEnd = (event: AnimationEvent<HTMLElement>) => {
    motion.handleAnimationEnd(event);
    onAnimationEnd?.(event);
  };

  return (
    <Element
      ref={attach}
      className={[className, motion.className, slotClassName].filter(Boolean).join(' ') || undefined}
      style={{ ...style, ...motion.style, ...slotStyle }}
      onAnimationEnd={handleAnimationEnd}
      {...attributes}
    >
      <StaggerChildren step={stagger}>{children}</StaggerChildren>
    </Element>
  );
}
