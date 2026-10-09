import { useImperativeHandle, type AnimationEvent, type HTMLAttributes, type Ref } from 'react';
import {
  dividerStylePropsSchema,
  type DividerSerializableProps,
  type DividerStyleProps,
} from '@inithium/shared-contracts';
import { useAnimation, type AnimationRuntimeProps } from '../animation/use-animation.hook';
import { splitStyleProps } from '../style-props/split-style-props.service';
import { resolveDividerStyles } from '../style-props/style-props.service';

const styleKeys = new Set(Object.keys(dividerStylePropsSchema.shape) as (keyof DividerStyleProps)[]);

export type DividerProps = DividerSerializableProps &
  AnimationRuntimeProps &
  Omit<HTMLAttributes<HTMLElement>, 'className' | 'style' | 'color' | 'children'> & {
    ref?: Ref<HTMLElement>;
  };

/**
 * A dividing line (decision 0060), horizontal or vertical, optionally with a label in it. A plain horizontal
 * divider is an <hr>; a vertical one is an inline separator <span>; a labelled one is text between two lines. `decorative`
 * hides it from screen readers.
 */
export function Divider(props: DividerProps) {
  const [styleProps, rest] = splitStyleProps(props, styleKeys);
  const {
    label,
    labelAlign = 'center',
    decorative = false,
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
  useImperativeHandle(ref, () => getElement() as HTMLElement);
  if (!mounted) return null;

  const orientation = styleProps.orientation ?? 'horizontal';
  const resolved = resolveDividerStyles(styleProps);
  const shared = {
    ref: attach,
    className: ['ui-divider', resolved.root.className, motion.className].filter(Boolean).join(' '),
    style: { ...resolved.root.style, ...motion.style },
    'data-orientation': orientation,
    onAnimationEnd: (event: AnimationEvent<HTMLElement>) => {
      motion.handleAnimationEnd(event);
      onAnimationEnd?.(event);
    },
  };

  // Labelled: the text is read as ordinary text; the lines are decoration.
  if (label) {
    return (
      <div {...shared} data-labelled="" data-label-align={labelAlign} aria-hidden={decorative || undefined} {...attributes}>
        <span className="ui-divider-line" aria-hidden="true" />
        <span className={['ui-divider-label', resolved.label.className].filter(Boolean).join(' ')} style={resolved.label.style}>
          {label}
        </span>
        <span className="ui-divider-line" aria-hidden="true" />
      </div>
    );
  }

  // A span, so it can sit inside a line of text.
  if (orientation === 'vertical') {
    return (
      <span
        {...shared}
        role={decorative ? 'none' : 'separator'}
        aria-orientation={decorative ? undefined : 'vertical'}
        {...attributes}
      />
    );
  }

  return <hr {...shared} role={decorative ? 'none' : undefined} {...attributes} />;
}
