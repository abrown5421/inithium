import { useCallback, useEffect, useId, useImperativeHandle, useRef, useState, type AnimationEvent, type Ref } from 'react';
import * as RadixSlider from '@radix-ui/react-slider';
import {
  sliderStylePropsSchema,
  type SliderMark,
  type SliderSerializableProps,
  type SliderStyleProps,
} from '@inithium/shared-contracts';
import { useAnimation, type AnimationRuntimeProps } from '../animation/use-animation.hook';
import { useDismissibleError } from '../form-field/use-dismissible-error.hook';
import { splitStyleProps } from '../style-props/split-style-props.service';
import { resolveSliderStyles } from '../style-props/style-props.service';

const styleKeys = new Set(Object.keys(sliderStylePropsSchema.shape) as (keyof SliderStyleProps)[]);

/** Thumb size in px; Radix keeps the thumb inside the track, and marks follow the same offset. */
const THUMB_SIZE = 16;

/** A single value, or a range of two. */
export type SliderValue = number | [number, number];

export type SliderProps<T extends SliderValue = number> = SliderSerializableProps &
  AnimationRuntimeProps & {
    /** The value: a number for one thumb, [low, high] for a range. */
    value?: T;
    defaultValue?: T;
    /** Called while the value changes, e.g. while dragging. */
    onValueChange?: (value: T) => void;
    /** Called once when a change ends, e.g. when the thumb is let go. */
    onValueCommit?: (value: T) => void;
    /** Formats the value in the label row, the bubble and for screen readers. Default String(value). */
    formatValue?: (value: number) => string;
    /** Marks the slider invalid. A message replaces helperText while shown. Changing the value hides it. */
    error?: boolean | string;
    disabled?: boolean;
    /** Inside a form, submits the value under this name (name[] for a range). */
    name?: string;
    id?: string;
    'aria-label'?: string;
    'aria-describedby'?: string;
    /** Fires when the wrapper's animation ends. */
    onAnimationEnd?: (event: AnimationEvent<HTMLDivElement>) => void;
    ref?: Ref<HTMLSpanElement>;
  };

const toArray = (value: SliderValue | undefined) => (value === undefined ? undefined : typeof value === 'number' ? [value] : [...value]);

/**
 * A slider for picking a number or a range (decisions 0056 and 0063): Radix's accessible slider with a filled
 * track in one colour, a value bubble, optional tick marks, a label row showing the value, helper text and an
 * error state. `ref` reaches the slider element.
 */
export function Slider<T extends SliderValue = number>(props: SliderProps<T>) {
  const [styleProps, rest] = splitStyleProps(props, styleKeys);
  const {
    id: idProp,
    value,
    defaultValue,
    onValueChange,
    onValueCommit,
    min = 0,
    max = 100,
    step = 1,
    minStepsBetweenThumbs,
    marks,
    valueLabel = 'auto',
    formatValue = String,
    label,
    helperText,
    error,
    required,
    disabled,
    name,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    animation,
    show,
    replay,
    onEntranceEnd,
    onExitEnd,
    ref,
    onAnimationEnd,
  } = rest;

  const generatedId = useId();
  const id = idProp ?? generatedId;
  const labelId = `${id}-label`;
  const helperId = `${id}-helper`;
  const slider = useRef<HTMLSpanElement>(null);

  const isRange = Array.isArray(value ?? defaultValue);
  const [current, setCurrent] = useState<number[]>(() => toArray(defaultValue) ?? [min]);
  const [dragging, setDragging] = useState(false);

  const motion = useAnimation({ animation, show, replay, onEntranceEnd, onExitEnd });
  const { mounted, attach } = motion;
  useImperativeHandle(ref, () => slider.current as HTMLSpanElement);
  // Radix adds a hidden input per thumb inside forms; any of them knows the form.
  const getForm = useCallback(() => slider.current?.querySelector('input')?.form, []);
  const fieldError = useDismissibleError(error, getForm, mounted);

  // Dragging ends wherever the pointer is released.
  useEffect(() => {
    if (!dragging) return;
    const stop = () => setDragging(false);
    window.addEventListener('pointerup', stop, { once: true });
    return () => window.removeEventListener('pointerup', stop);
  }, [dragging]);

  if (!mounted) return null;

  const values = toArray(value) ?? current;
  const fromArray = (next: number[]) => (isRange ? [next[0], next[1]] : next[0]) as T;
  const { className, style } = resolveSliderStyles(styleProps, fieldError.shown);
  const helper = fieldError.message ?? helperText;
  const describedBy = [ariaDescribedBy, helper ? helperId : undefined].filter(Boolean).join(' ') || undefined;
  const display = values.map(formatValue).join(' – ');
  const markList: SliderMark[] =
    marks === true ? Array.from({ length: Math.floor((max - min) / step) + 1 }, (_, index) => ({ value: min + index * step })) : (marks ?? []);
  const isFilled = (mark: number) => (isRange ? mark >= values[0] && mark <= values[1] : mark <= values[0]);
  const thumbName = (index: number) => {
    const base = label ?? ariaLabel;
    if (!isRange) return label ? undefined : ariaLabel;
    return base ? `${base} ${index === 0 ? 'minimum' : 'maximum'}` : undefined;
  };

  const handleValueChange = (next: number[]) => {
    if (fieldError.shown) fieldError.dismiss();
    setCurrent(next);
    onValueChange?.(fromArray(next));
  };
  const handleAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    motion.handleAnimationEnd(event);
    onAnimationEnd?.(event);
  };

  return (
    <div
      ref={attach}
      className={['ui-slider', className, motion.className].filter(Boolean).join(' ')}
      style={{ ...style, ...motion.style }}
      data-value-label={valueLabel}
      data-mark-labels={markList.some((mark) => mark.label) ? '' : undefined}
      data-dragging={dragging ? '' : undefined}
      data-error={fieldError.shown ? '' : undefined}
      data-disabled={disabled ? '' : undefined}
      onAnimationEnd={handleAnimationEnd}
    >
      {label && (
        <div className="ui-slider-header">
          <span id={labelId} className="ui-slider-label">
            {label}
            {required && <span aria-hidden="true"> *</span>}
          </span>
          <span className="ui-slider-value" aria-hidden="true">
            {display}
          </span>
        </div>
      )}
      <RadixSlider.Root
        ref={slider}
        id={id}
        className="ui-slider-root"
        value={toArray(value)}
        defaultValue={toArray(defaultValue)}
        onValueChange={handleValueChange}
        onValueCommit={(next) => onValueCommit?.(fromArray(next))}
        onPointerDown={() => setDragging(true)}
        min={min}
        max={max}
        step={step}
        minStepsBetweenThumbs={minStepsBetweenThumbs}
        disabled={disabled}
        name={name}
      >
        <RadixSlider.Track className="ui-slider-track">
          <RadixSlider.Range className="ui-slider-range" />
        </RadixSlider.Track>
        {markList.length > 0 && (
          <span className="ui-slider-marks" aria-hidden="true">
            {markList.map((mark) => {
              const percent = ((mark.value - min) / (max - min)) * 100;
              const offset = THUMB_SIZE / 2 - (percent / 100) * THUMB_SIZE;
              return (
                <span
                  key={mark.value}
                  className="ui-slider-mark"
                  data-active={isFilled(mark.value) ? '' : undefined}
                  style={{ left: `calc(${percent}% + ${offset}px)` }}
                >
                  {mark.label && <span className="ui-slider-mark-label">{mark.label}</span>}
                </span>
              );
            })}
          </span>
        )}
        {values.map((thumbValue, index) => (
          <RadixSlider.Thumb
            key={index}
            className="ui-slider-thumb"
            aria-label={thumbName(index)}
            aria-labelledby={!isRange && label ? labelId : undefined}
            aria-valuetext={formatValue(thumbValue)}
            aria-describedby={describedBy}
            aria-invalid={fieldError.shown || undefined}
          >
            <span className="ui-slider-bubble">{formatValue(thumbValue)}</span>
          </RadixSlider.Thumb>
        ))}
      </RadixSlider.Root>
      {helper && (
        <p id={helperId} className="ui-slider-helper">
          {helper}
        </p>
      )}
    </div>
  );
}
