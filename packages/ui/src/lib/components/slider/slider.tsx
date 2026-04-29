import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Field, Label, Description } from '@headlessui/react';
import { cn, INTERACTIVE_COLOR_MAP, COMPONENT_SIZE_MAP } from '@inithium/utils';
import type { ThemeColor, ComponentSize } from '@inithium/types';
import type { SliderVariant, SliderProps } from './slider.types';

const SLIDER_SIZE_MAP: Record<ComponentSize, { track: string; thumb: string; label: string }> = {
  sm: { track: 'h-1',   thumb: 'w-3 h-3',   label: 'text-xs' },
  base: { track: 'h-1.5', thumb: 'w-4 h-4', label: 'text-sm' },
  lg: { track: 'h-2',   thumb: 'w-5 h-5',   label: 'text-base' },
  xl: { track: 'h-2.5', thumb: 'w-6 h-6',   label: 'text-lg' },
};

const LABEL_SIZE_MAP: Record<ComponentSize, string> = {
  sm: 'text-xs',
  base: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg',
};

const getTrackStyles = (variant: SliderVariant, color: ThemeColor, invalid: boolean): string => {
  const c = INTERACTIVE_COLOR_MAP[color];

  if (invalid) {
    const danger = INTERACTIVE_COLOR_MAP['danger'];
    return cn('rounded-full bg-surface border-2', danger.border);
  }

  const styles: Record<SliderVariant, string> = {
    filled: cn('rounded-full', c.bg),
    outlined: cn('rounded-full bg-surface border-2', c.border),
    ghost: cn('rounded-none bg-on-surface/10'),
  };

  return styles[variant];
};

const getThumbStyles = (variant: SliderVariant, color: ThemeColor, invalid: boolean): string => {
  const c = INTERACTIVE_COLOR_MAP[color];

  if (invalid) {
    const danger = INTERACTIVE_COLOR_MAP['danger'];
    return cn(
      'rounded-full border-2 shadow-md bg-surface transition-transform duration-150',
      danger.border,
      'hover:scale-110 active:scale-95',
    );
  }

  const styles: Record<SliderVariant, string> = {
    filled: cn(
      'rounded-full border-2 border-transparent shadow-md transition-transform duration-150',
      c.bg,
      'hover:scale-110 active:scale-95',
    ),
    outlined: cn(
      'rounded-full border-2 bg-surface shadow-md transition-transform duration-150',
      c.border,
      'hover:scale-110 active:scale-95',
    ),
    ghost: cn(
      'rounded-full border-2 bg-surface shadow-md transition-transform duration-150',
      c.border,
      'hover:scale-110 active:scale-95',
    ),
  };

  return styles[variant];
};

const getFillStyles = (color: ThemeColor, invalid: boolean): string => {
  const c = INTERACTIVE_COLOR_MAP[color];
  if (invalid) {
    return INTERACTIVE_COLOR_MAP['danger'].bg;
  }
  return c.bg;
};

export const Slider: React.FC<SliderProps> = ({
  variant = 'outlined',
  size = 'base',
  color = 'primary',
  label,
  description,
  error,
  className = '',
  sliderClassName = '',
  trackClassName = '',
  labelClassName = '',
  descriptionClassName = '',
  errorClassName = '',
  wrapperClassName = '',
  invalid = false,
  disabled = false,
  min = 0,
  max = 100,
  step = 1,
  value: controlledValue,
  defaultValue = 0,
  onChange,
  showValue = false,
  formatValue,
  ...props
}) => {
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState<number>(defaultValue);
  const value = isControlled ? controlledValue : internalValue;

  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  const snap = (v: number) => Math.round((v - min) / step) * step + min;
  const percent = ((value - min) / (max - min)) * 100;

  const computeValue = useCallback(
    (clientX: number): number => {
      const track = trackRef.current;
      if (!track) return value;
      const { left, width } = track.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - left) / width));
      return clamp(snap(min + ratio * (max - min)));
    },
    [min, max, step, value],
  );

  const handleChange = useCallback(
    (newValue: number) => {
      if (!isControlled) setInternalValue(newValue);
      onChange?.(newValue);
    },
    [isControlled, onChange],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      isDragging.current = true;
      handleChange(computeValue(e.clientX));
    },
    [disabled, computeValue, handleChange],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current || disabled) return;
      handleChange(computeValue(e.clientX));
    },
    [disabled, computeValue, handleChange],
  );

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;
      const stepAmount = e.shiftKey ? step * 10 : step;
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowUp':
          e.preventDefault();
          handleChange(clamp(snap(value + stepAmount)));
          break;
        case 'ArrowLeft':
        case 'ArrowDown':
          e.preventDefault();
          handleChange(clamp(snap(value - stepAmount)));
          break;
        case 'Home':
          e.preventDefault();
          handleChange(min);
          break;
        case 'End':
          e.preventDefault();
          handleChange(max);
          break;
      }
    },
    [disabled, value, step, min, max, handleChange, snap, clamp],
  );

  const sizeTokens = SLIDER_SIZE_MAP[size as ComponentSize];
  const displayValue = formatValue ? formatValue(value) : String(value);

  return (
    <Field
      disabled={disabled}
      className={cn('flex flex-col gap-1 w-full', disabled && 'opacity-50', className)}
    >
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && (
            <Label
              className={cn(
                'font-medium text-on-surface',
                LABEL_SIZE_MAP[size as ComponentSize],
                labelClassName,
              )}
            >
              {label}
            </Label>
          )}
          {showValue && (
            <span
              className={cn(
                'tabular-nums text-on-surface/70',
                LABEL_SIZE_MAP[size as ComponentSize],
              )}
            >
              {displayValue}
            </span>
          )}
        </div>
      )}

      <div className={cn('relative flex items-center py-2', wrapperClassName)}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          className="sr-only"
          onChange={(e) => handleChange(Number(e.target.value))}
          aria-valuenow={value}
          aria-valuemin={min}
          aria-valuemax={max}
          {...props}
        />

        <div
          ref={trackRef}
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-valuenow={value}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-disabled={disabled}
          aria-label={typeof label === 'string' ? label : undefined}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onKeyDown={handleKeyDown}
          className={cn(
            'relative w-full cursor-pointer select-none',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
            `focus-visible:ring-${color}-500`,
            disabled && 'cursor-not-allowed',
            sliderClassName,
          )}
        >
          <div
            className={cn(
              'w-full',
              sizeTokens.track,
              getTrackStyles(variant, color as ThemeColor, invalid),
              trackClassName,
            )}
          >
            <div
              className={cn(
                'h-full rounded-full transition-none',
                getFillStyles(color as ThemeColor, invalid),
              )}
              style={{ width: `${percent}%` }}
            />
          </div>

          <div
            className={cn(
              'absolute top-1/2 -translate-y-1/2 -translate-x-1/2',
              sizeTokens.thumb,
              getThumbStyles(variant, color as ThemeColor, invalid),
            )}
            style={{ left: `${percent}%` }}
          />
        </div>
      </div>

      {description && !error && (
        <Description className={cn('text-xs text-on-surface/60', descriptionClassName)}>
          {description}
        </Description>
      )}

      {error && (
        <p className={cn('text-xs', INTERACTIVE_COLOR_MAP['danger'].text, errorClassName)}>
          {error}
        </p>
      )}
    </Field>
  );
};