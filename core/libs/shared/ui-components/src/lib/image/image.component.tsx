import { useImperativeHandle, type AnimationEvent, type ImgHTMLAttributes, type Ref } from 'react';
import { imageStylePropsSchema, type ImageSerializableProps, type ImageStyleProps } from '@inithium/shared-contracts';
import { useAnimation, type AnimationRuntimeProps } from '../animation/use-animation.hook';
import { splitStyleProps } from '../style-props/split-style-props.service';
import { resolveContainerStyles } from '../style-props/style-props.service';

const styleKeys = new Set(Object.keys(imageStylePropsSchema.shape) as (keyof ImageStyleProps)[]);

export type ImageProps = ImageSerializableProps &
  AnimationRuntimeProps &
  Omit<ImgHTMLAttributes<HTMLImageElement>, 'className' | 'style' | 'src' | 'alt' | 'width' | 'height' | 'loading'> & {
    ref?: Ref<HTMLImageElement>;
  };

/**
 * An image (decision 0098): a native <img> with the UI library's size, spacing, corner, border and shadow props, how
 * it fits its box, and an aspect ratio to hold its shape while it loads. It must be described (`alt`) unless it's
 * `decorative`, which hides it from screen readers. Images load lazily by default.
 */
export function Image(props: ImageProps) {
  const [styleProps, rest] = splitStyleProps(props, styleKeys);
  const { src, alt, decorative, fit, aspectRatio, loading = 'lazy', animation, show, replay, onEntranceEnd, onExitEnd, ref, onAnimationEnd, ...attributes } =
    rest;

  const motion = useAnimation({ animation, show, replay, onEntranceEnd, onExitEnd });
  const { mounted, attach, getElement } = motion;
  // Expose the rendered element through the caller's ref (refreshed after every commit).
  useImperativeHandle(ref, () => getElement() as HTMLImageElement);
  if (!mounted) return null;

  const { className, style } = resolveContainerStyles(styleProps);
  const handleAnimationEnd = (event: AnimationEvent<HTMLImageElement>) => {
    motion.handleAnimationEnd(event);
    onAnimationEnd?.(event);
  };
  // With both sides fixed, the image covers its box unless told otherwise; with one, it keeps its own shape.
  const objectFit = fit ?? (styleProps.width !== undefined && styleProps.height !== undefined ? 'cover' : undefined);

  return (
    <img
      ref={attach as Ref<HTMLImageElement>}
      src={src}
      alt={decorative ? '' : (alt ?? '')}
      aria-hidden={decorative || undefined}
      loading={loading}
      decoding="async"
      className={['block max-w-full', className, motion.className].filter(Boolean).join(' ')}
      style={{ ...style, ...motion.style, objectFit, aspectRatio }}
      onAnimationEnd={handleAnimationEnd}
      {...attributes}
    />
  );
}
