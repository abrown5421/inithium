import React, { useEffect, useRef, CSSProperties } from 'react';
import { LoaderProps, LoaderVariant } from './loader.types';
import { resolveColor } from './loader.utils';
import { injectLoaderStyles } from './loader.styles';
import {
  SpinnerVariant,
  DotsVariant,
  BarsVariant,
  PulseVariant,
  RingVariant,
  WaveVariant,
  BounceVariant,
  OrbitVariant,
  RippleVariant,
} from './loader.variants';
import { cn } from '@inithium/utils';

const VARIANT_MAP: Record<
  LoaderVariant,
  React.FC<{ color: string; sizePx: number }>
> = {
  spinner: SpinnerVariant,
  dots: DotsVariant,
  bars: BarsVariant,
  pulse: PulseVariant,
  ring: RingVariant,
  wave: WaveVariant,
  bounce: BounceVariant,
  orbit: OrbitVariant,
  ripple: RippleVariant,
};

export function Loader({
  variant = 'spinner',
  color = 'primary',
  size,
  className,
  'aria-label': ariaLabel = 'Loading',
}: LoaderProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    injectLoaderStyles();
  }, []);

  const VariantComponent = VARIANT_MAP[variant];
  const resolvedColor = resolveColor(color);

  const hasExplicitSize = size !== undefined;
  const explicitPx: number | undefined =
    hasExplicitSize
      ? typeof size === 'number'
        ? size
        : parseFloat(size as string)
      : undefined;

  const [measuredPx, setMeasuredPx] = React.useState<number>(32);

  useEffect(() => {
    if (hasExplicitSize || !wrapperRef.current) return;

    const update = () => {
      const el = wrapperRef.current;
      if (!el) return;
      setMeasuredPx(Math.min(el.offsetWidth, el.offsetHeight));
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, [hasExplicitSize]);

  const activePx = hasExplicitSize ? (explicitPx ?? 32) : measuredPx;

  const safePx = Math.max(activePx, 8);

  const wrapperStyle: CSSProperties = hasExplicitSize
    ? {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${size}px` : size,
        flexShrink: 0,
      }
    : {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
      };

  return (
    <div
      ref={wrapperRef}
      role="status"
      aria-label={ariaLabel}
      aria-live="polite"
      className={cn(className)}
      style={wrapperStyle}
    >
      <VariantComponent color={resolvedColor} sizePx={safePx} />
      <span
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: 'hidden',
          clip: 'rect(0,0,0,0)',
          whiteSpace: 'nowrap',
          borderWidth: 0,
        }}
      >
        {ariaLabel}
      </span>
    </div>
  );
}