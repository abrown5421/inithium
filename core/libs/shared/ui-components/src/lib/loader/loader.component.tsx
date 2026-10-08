import { useImperativeHandle, type AnimationEvent, type HTMLAttributes, type Ref } from 'react';
import {
  loaderStylePropsSchema,
  type LoaderSerializableProps,
  type LoaderStyleProps,
  type LoaderVariant,
} from '@inithium/shared-contracts';
import { useAnimation, type AnimationRuntimeProps } from '../animation/use-animation.hook';
import { splitStyleProps } from '../style-props/split-style-props.service';
import { resolveLoaderStyles } from '../style-props/style-props.service';

const styleKeys = new Set(Object.keys(loaderStylePropsSchema.shape) as (keyof LoaderStyleProps)[]);

export type LoaderProps = LoaderSerializableProps &
  AnimationRuntimeProps &
  Omit<HTMLAttributes<HTMLSpanElement>, 'className' | 'style' | 'color' | 'children'> & {
    /** Progress from 0 to 100, for the progress variant. Without it, the bar slides. */
    value?: number;
    ref?: Ref<HTMLSpanElement>;
  };

/**
 * A loading indicator (decision 0058): spinner, dots, bars, pulse or a progress bar, in one colour. Announced as
 * a status ("Loading", or `label`); a progress bar with a `value` is announced as a progressbar instead.
 */
export function Loader(props: LoaderProps) {
  const [styleProps, rest] = splitStyleProps(props, styleKeys);
  const {
    label = 'Loading',
    value,
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
  useImperativeHandle(ref, () => getElement() as HTMLSpanElement);
  if (!mounted) return null;

  const variant = styleProps.variant ?? 'spinner';
  const { className, style } = resolveLoaderStyles(styleProps);
  const progress = variant === 'progress' && value !== undefined ? Math.min(100, Math.max(0, value)) : undefined;
  const semantics =
    progress === undefined
      ? { role: 'status' }
      : { role: 'progressbar', 'aria-label': label, 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': Math.round(progress) };

  const handleAnimationEnd = (event: AnimationEvent<HTMLSpanElement>) => {
    motion.handleAnimationEnd(event);
    onAnimationEnd?.(event);
  };

  return (
    <span
      ref={attach}
      className={['ui-loader', className, motion.className].filter(Boolean).join(' ')}
      style={{ ...style, ...motion.style }}
      data-variant={variant}
      onAnimationEnd={handleAnimationEnd}
      {...semantics}
      {...attributes}
    >
      {progress === undefined && <span className="ui-loader-label">{label}</span>}
      <LoaderGraphic variant={variant} progress={progress} />
    </span>
  );
}

/** The moving part of each variant, hidden from screen readers. */
function LoaderGraphic({ variant, progress }: { variant: LoaderVariant; progress?: number }) {
  switch (variant) {
    case 'spinner':
      return <span className="ui-loader-spinner" aria-hidden="true" />;
    case 'dots':
      return <Pieces className="ui-loader-dots" count={3} />;
    case 'bars':
      return <Pieces className="ui-loader-bars" count={4} />;
    case 'pulse':
      return <span className="ui-loader-pulse" aria-hidden="true" />;
    case 'ring':
      return <span className="ui-loader-ring" aria-hidden="true" />;
    case 'orbit':
      return <span className="ui-loader-orbit" aria-hidden="true" />;
    case 'wave':
      return <Pieces className="ui-loader-wave" count={4} />;
    case 'grid':
      return <Pieces className="ui-loader-grid" count={9} />;
    case 'segments':
      return <Pieces className="ui-loader-segments" count={8} />;
    case 'progress':
      return (
        <span className="ui-loader-progress" data-indeterminate={progress === undefined ? '' : undefined} aria-hidden="true">
          <span className="ui-loader-progress-bar" style={progress === undefined ? undefined : { width: `${progress}%` }} />
        </span>
      );
  }
}

/** A variant drawn from identical pieces (dots, bars, squares…), which the stylesheet animates in sequence. */
function Pieces({ className, count }: { className: string; count: number }) {
  return (
    <span className={className} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <span key={index} />
      ))}
    </span>
  );
}
