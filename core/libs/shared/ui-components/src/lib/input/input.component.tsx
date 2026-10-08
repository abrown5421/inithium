import {
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type AnimationEvent,
  type ChangeEvent,
  type InputHTMLAttributes,
  type MouseEvent,
  type ReactNode,
  type Ref,
} from 'react';
import {
  inputStylePropsSchema,
  type InputSerializableProps,
  type InputStyleProps,
  type InputType,
} from '@inithium/shared-contracts';
import { useAnimation, type AnimationRuntimeProps } from '../animation/use-animation.hook';
import type { IconName } from '../icon/icon.component';
import { splitStyleProps } from '../style-props/split-style-props.service';
import { resolveInputStyles } from '../style-props/style-props.service';
import { InputAdornment } from './input-adornment.component';
import { InputContext } from './input.context';

const styleKeys = new Set(Object.keys(inputStylePropsSchema.shape) as (keyof InputStyleProps)[]);

export type InputProps = Omit<InputSerializableProps, 'type' | 'leadingIcon' | 'trailingIcon'> &
  AnimationRuntimeProps &
  Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'className' | 'style' | 'color' | 'type' | 'size' | 'children' | 'onAnimationEnd'
  > & {
    type?: InputType;
    /** A decorative Lucide icon before the text. */
    leadingIcon?: IconName;
    /** A decorative Lucide icon after the text. */
    trailingIcon?: IconName;
    /** Anything before the text, e.g. an InputAdornment. Replaces leadingIcon. */
    startAdornment?: ReactNode;
    /** Anything after the text, e.g. a clear button. Replaces trailingIcon. */
    endAdornment?: ReactNode;
    /** Marks the field invalid. A message replaces helperText while shown. Editing the field hides it. */
    error?: boolean | string;
    /** Called with the new value on every change. */
    onValueChange?: (value: string) => void;
    /** Fires when the wrapper's animation ends. */
    onAnimationEnd?: (event: AnimationEvent<HTMLDivElement>) => void;
    ref?: Ref<HTMLInputElement>;
  };

/**
 * A single-line text field (decision 0055) in the outlined, filled or standard variant, with a floating label,
 * helper text, an error state, adornments and a built-in password toggle. `ref` reaches the <input>.
 */
export function Input(props: InputProps) {
  const [styleProps, rest] = splitStyleProps(props, styleKeys);
  const {
    type = 'text',
    id: idProp,
    label,
    placeholder,
    helperText,
    error,
    required,
    disabled,
    leadingIcon,
    trailingIcon,
    startAdornment,
    endAdornment,
    onChange,
    onValueChange,
    'aria-describedby': ariaDescribedBy,
    animation,
    show,
    replay,
    onEntranceEnd,
    onExitEnd,
    ref,
    onAnimationEnd,
    ...attributes
  } = rest;

  const generatedId = useId();
  const id = idProp ?? generatedId;
  const helperId = `${id}-helper`;
  const control = useRef<HTMLInputElement>(null);
  const start = useRef<HTMLSpanElement>(null);
  const [revealed, setRevealed] = useState(false);

  // An error is hidden once the user edits the field, and shown again when `error` changes or the form submits.
  const [dismissed, setDismissed] = useState(false);
  const [previousError, setPreviousError] = useState(error);
  if (error !== previousError) {
    setPreviousError(error);
    setDismissed(false);
  }
  const showError = Boolean(error) && !dismissed;

  const motion = useAnimation({ animation, show, replay, onEntranceEnd, onExitEnd });
  const { mounted, attach, getElement } = motion;
  useImperativeHandle(ref, () => control.current as HTMLInputElement);

  const hasStart = Boolean(startAdornment ?? leadingIcon);
  // Publish where the text starts, so a resting label sits after a start adornment.
  useLayoutEffect(() => {
    const root = getElement();
    const input = control.current;
    if (!mounted || !root || !input) return;
    const update = () => root.style.setProperty('--ui-input-text-x', `${input.offsetLeft}px`);
    update();
    const observer = new ResizeObserver(update);
    if (start.current) observer.observe(start.current);
    return () => observer.disconnect();
  }, [mounted, hasStart, getElement]);

  useEffect(() => {
    const form = control.current?.form;
    if (!mounted || !form) return;
    const reset = () => setDismissed(false);
    form.addEventListener('submit', reset);
    return () => form.removeEventListener('submit', reset);
  }, [mounted]);

  if (!mounted) return null;

  const variant = styleProps.variant ?? 'outlined';
  const { root, field } = resolveInputStyles(styleProps, showError);
  const isPassword = type === 'password';
  const leading = startAdornment ?? (leadingIcon && <InputAdornment icon={leadingIcon} />);
  const trailing = endAdornment ?? (trailingIcon && <InputAdornment icon={trailingIcon} />);
  const helper = showError && typeof error === 'string' ? error : helperText;
  const describedBy = [ariaDescribedBy, helper ? helperId : undefined].filter(Boolean).join(' ') || undefined;
  const labelContent = label && (
    <>
      {label}
      {required && <span aria-hidden="true"> *</span>}
    </>
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (showError) setDismissed(true);
    onChange?.(event);
    onValueChange?.(event.target.value);
  };
  // Clicking the field's padding focuses the input.
  const focusControl = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    event.preventDefault();
    control.current?.focus();
  };
  const handleAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    motion.handleAnimationEnd(event);
    onAnimationEnd?.(event);
  };

  return (
    <InputContext.Provider value={{ disabled: Boolean(disabled) }}>
      <div
        ref={attach}
        className={['ui-input', root.className, motion.className].filter(Boolean).join(' ')}
        style={{ ...root.style, ...motion.style }}
        data-variant={variant}
        data-has-label={label ? '' : undefined}
        data-label-above={label && variant !== 'outlined' ? '' : undefined}
        data-error={showError ? '' : undefined}
        data-disabled={disabled ? '' : undefined}
        onAnimationEnd={handleAnimationEnd}
      >
        <div
          className={['ui-input-field', field.className].filter(Boolean).join(' ')}
          style={field.style}
          onMouseDown={focusControl}
        >
          {leading && (
            <span ref={start} className="ui-input-adornments">
              {leading}
            </span>
          )}
          <input
            ref={control}
            id={id}
            type={isPassword && revealed ? 'text' : type}
            className="ui-input-control"
            // A blank placeholder lets CSS tell an empty field (:placeholder-shown) from a filled one.
            placeholder={placeholder || ' '}
            required={required}
            disabled={disabled}
            aria-invalid={showError || undefined}
            aria-describedby={describedBy}
            onChange={handleChange}
            {...attributes}
          />
          {(trailing || isPassword) && (
            <span className="ui-input-adornments">
              {trailing}
              {isPassword && (
                <InputAdornment
                  icon={revealed ? 'eye-off' : 'eye'}
                  label={revealed ? 'Hide password' : 'Show password'}
                  onClick={() => setRevealed((value) => !value)}
                />
              )}
            </span>
          )}
          {variant === 'outlined' && (
            <fieldset aria-hidden="true" className="ui-input-outline">
              <legend>{labelContent && <span>{labelContent}</span>}</legend>
            </fieldset>
          )}
        </div>
        {label && (
          <label htmlFor={id} className="ui-input-label">
            {labelContent}
          </label>
        )}
        {helper && (
          <p id={helperId} className="ui-input-helper">
            {helper}
          </p>
        )}
      </div>
    </InputContext.Provider>
  );
}
