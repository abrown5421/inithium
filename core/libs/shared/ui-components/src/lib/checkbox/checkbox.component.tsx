import {
  useCallback,
  useId,
  useImperativeHandle,
  useRef,
  type AnimationEvent,
  type ComponentPropsWithoutRef,
  type Ref,
} from 'react';
import * as RadixCheckbox from '@radix-ui/react-checkbox';
import {
  checkboxStylePropsSchema,
  type CheckboxSerializableProps,
  type CheckboxStyleProps,
} from '@inithium/shared-contracts';
import { useAnimation, type AnimationRuntimeProps } from '../animation/use-animation.hook';
import { useDismissibleError } from '../form-field/use-dismissible-error.hook';
import { Icon } from '../icon/icon.component';
import { splitStyleProps } from '../style-props/split-style-props.service';
import { resolveCheckboxStyles } from '../style-props/style-props.service';

const styleKeys = new Set(Object.keys(checkboxStylePropsSchema.shape) as (keyof CheckboxStyleProps)[]);

/** Size of the check and dash inside the 18px box, in px. */
const MARK_SIZE = 14;

export type CheckedState = RadixCheckbox.CheckedState;

export type CheckboxProps = CheckboxSerializableProps &
  AnimationRuntimeProps &
  Omit<
    ComponentPropsWithoutRef<typeof RadixCheckbox.Root>,
    'className' | 'style' | 'color' | 'children' | 'asChild' | 'onAnimationEnd'
  > & {
    /** Marks the box invalid. A message replaces helperText while shown. Toggling the box hides it. */
    error?: boolean | string;
    /** Fires when the wrapper's animation ends. */
    onAnimationEnd?: (event: AnimationEvent<HTMLDivElement>) => void;
    ref?: Ref<HTMLButtonElement>;
  };

/**
 * A checkbox (decisions 0056 and 0057): Radix's accessible checkbox, styled from one colour, with a label,
 * helper text, an error state and an indeterminate state. `ref` reaches the box (a <button role="checkbox">).
 */
export function Checkbox(props: CheckboxProps) {
  const [styleProps, rest] = splitStyleProps(props, styleKeys);
  const {
    id: idProp,
    label,
    helperText,
    error,
    required,
    disabled,
    onCheckedChange,
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
  const box = useRef<HTMLButtonElement>(null);

  const motion = useAnimation({ animation, show, replay, onEntranceEnd, onExitEnd });
  const { mounted, attach } = motion;
  useImperativeHandle(ref, () => box.current as HTMLButtonElement);
  const getForm = useCallback(() => box.current?.form, []);
  const fieldError = useDismissibleError(error, getForm, mounted);

  if (!mounted) return null;

  const { className, style } = resolveCheckboxStyles(styleProps, fieldError.shown);
  const helper = fieldError.message ?? helperText;
  const describedBy = [ariaDescribedBy, helper ? helperId : undefined].filter(Boolean).join(' ') || undefined;

  const handleCheckedChange = (checked: CheckedState) => {
    if (fieldError.shown) fieldError.dismiss();
    onCheckedChange?.(checked);
  };
  const handleAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    motion.handleAnimationEnd(event);
    onAnimationEnd?.(event);
  };

  return (
    <div
      ref={attach}
      className={['ui-checkbox', className, motion.className].filter(Boolean).join(' ')}
      style={{ ...style, ...motion.style }}
      data-error={fieldError.shown ? '' : undefined}
      data-disabled={disabled ? '' : undefined}
      onAnimationEnd={handleAnimationEnd}
    >
      <div className="ui-checkbox-row">
        <RadixCheckbox.Root
          ref={box}
          id={id}
          className="ui-checkbox-box"
          required={required}
          disabled={disabled}
          aria-invalid={fieldError.shown || undefined}
          aria-describedby={describedBy}
          onCheckedChange={handleCheckedChange}
          {...attributes}
        >
          <RadixCheckbox.Indicator className="ui-checkbox-indicator">
            {/* Radix renders the indicator only while checked or indeterminate; the state picks the mark. */}
            <CheckMark />
          </RadixCheckbox.Indicator>
        </RadixCheckbox.Root>
        {label && (
          <label htmlFor={id} className="ui-checkbox-label">
            {label}
            {required && <span aria-hidden="true"> *</span>}
          </label>
        )}
      </div>
      {helper && (
        <p id={helperId} className="ui-checkbox-helper">
          {helper}
        </p>
      )}
    </div>
  );
}

/** A check, or a dash while indeterminate, read from the box's data-state. */
function CheckMark() {
  return (
    <>
      <span className="ui-checkbox-mark-checked">
        <Icon name="check" size={MARK_SIZE} strokeWidth={3} />
      </span>
      <span className="ui-checkbox-mark-indeterminate">
        <Icon name="minus" size={MARK_SIZE} strokeWidth={3} />
      </span>
    </>
  );
}
