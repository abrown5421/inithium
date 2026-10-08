import { useImperativeHandle, type AnimationEvent, type ElementType, type HTMLAttributes, type ReactNode, type Ref } from 'react';
import { textStylePropsSchema, type TextSerializableProps, type TextStyleProps } from '@inithium/shared-contracts';
import { StaggerChildren } from '../animation/stagger-children.component';
import { useAnimation, type AnimationRuntimeProps } from '../animation/use-animation.hook';
import { splitStyleProps } from '../style-props/split-style-props.service';
import { resolveTextStyles } from '../style-props/style-props.service';

const styleKeys = new Set(Object.keys(textStylePropsSchema.shape) as (keyof TextStyleProps)[]);

export type TextProps = TextSerializableProps &
  AnimationRuntimeProps &
  Omit<HTMLAttributes<HTMLElement>, 'className' | 'style' | 'color'> & {
    /** For `as="label"`: the id of the input it labels. */
    htmlFor?: string;
    children?: ReactNode;
    ref?: Ref<HTMLElement>;
  };

/** Text: typography, colour, spacing and animation through props. Renders a <p> unless `as` says otherwise. */
export function Text(props: TextProps) {
  const [styleProps, rest] = splitStyleProps(props, styleKeys);
  const { children, animation, show, replay, onEntranceEnd, onExitEnd, ref, onAnimationEnd, ...attributes } = rest;

  const motion = useAnimation({ animation, show, replay, onEntranceEnd, onExitEnd });
  const { mounted, attach, getElement } = motion;
  // Expose the rendered element through the caller's ref (refreshed after every commit).
  useImperativeHandle(ref, () => getElement() as HTMLElement);
  if (!mounted) return null;

  // The allowed tags are constrained by the prop types; ElementType lets one ref type cover them all.
  const Element = (styleProps.as ?? 'p') as ElementType;
  const { className, style } = resolveTextStyles(styleProps);
  const handleAnimationEnd = (event: AnimationEvent<HTMLElement>) => {
    motion.handleAnimationEnd(event);
    onAnimationEnd?.(event);
  };

  return (
    <Element
      ref={attach}
      className={[className, motion.className].filter(Boolean).join(' ') || undefined}
      style={{ ...style, ...motion.style }}
      onAnimationEnd={handleAnimationEnd}
      {...attributes}
    >
      <StaggerChildren>{children}</StaggerChildren>
    </Element>
  );
}
