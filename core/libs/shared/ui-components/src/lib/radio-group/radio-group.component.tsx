import {
  useCallback,
  useId,
  useImperativeHandle,
  useRef,
  type AnimationEvent,
  type ComponentPropsWithoutRef,
  type Ref,
} from 'react';
import * as RadixRadioGroup from '@radix-ui/react-radio-group';
import {
  radioGroupStylePropsSchema,
  type RadioGroupSerializableProps,
  type RadioGroupStyleProps,
} from '@inithium/shared-contracts';
import { useAnimation, type AnimationRuntimeProps } from '../animation/use-animation.hook';
import { useDismissibleError } from '../form-field/use-dismissible-error.hook';
import { Icon, type IconName } from '../icon/icon.component';
import { splitStyleProps } from '../style-props/split-style-props.service';
import { resolveRadioGroupStyles } from '../style-props/style-props.service';

const styleKeys = new Set(Object.keys(radioGroupStylePropsSchema.shape) as (keyof RadioGroupStyleProps)[]);

/** Icon size on a card option, in px. */
const OPTION_ICON_SIZE = 20;

/** One choice in a RadioGroup, with its icon typed as Lucide's names. */
export type RadioGroupOption = Omit<RadioGroupSerializableProps['options'][number], 'icon'> & { icon?: IconName };

export type RadioGroupProps = Omit<RadioGroupSerializableProps, 'options'> &
  AnimationRuntimeProps &
  Omit<
    ComponentPropsWithoutRef<typeof RadixRadioGroup.Root>,
    'className' | 'style' | 'color' | 'children' | 'asChild' | 'orientation' | 'onAnimationEnd'
  > & {
    options: RadioGroupOption[];
    /** Marks the group invalid. A message replaces helperText while shown. Choosing an option hides it. */
    error?: boolean | string;
    /** Fires when the wrapper's animation ends. */
    onAnimationEnd?: (event: AnimationEvent<HTMLDivElement>) => void;
    ref?: Ref<HTMLDivElement>;
  };

/**
 * A set of options where exactly one can be chosen (decisions 0056 and 0061): Radix's accessible radio group,
 * as plain rows or bordered cards, vertical or horizontal, with a group label, helper text and an error state.
 * Options are data, so a group can be stored. `ref` reaches the radiogroup element.
 */
export function RadioGroup(props: RadioGroupProps) {
  const [styleProps, rest] = splitStyleProps(props, styleKeys);
  const {
    id: idProp,
    options,
    label,
    helperText,
    error,
    required,
    disabled,
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
  const labelId = `${id}-label`;
  const helperId = `${id}-helper`;
  const group = useRef<HTMLDivElement>(null);

  const motion = useAnimation({ animation, show, replay, onEntranceEnd, onExitEnd });
  const { mounted, attach } = motion;
  useImperativeHandle(ref, () => group.current as HTMLDivElement);
  // The radios are buttons, so any of them knows the form.
  const getForm = useCallback(() => group.current?.querySelector('button')?.form, []);
  const fieldError = useDismissibleError(error, getForm, mounted);

  if (!mounted) return null;

  const variant = styleProps.variant ?? 'plain';
  const orientation = styleProps.orientation ?? 'vertical';
  const { className, style } = resolveRadioGroupStyles(styleProps, fieldError.shown);
  const helper = fieldError.message ?? helperText;
  const describedBy = [ariaDescribedBy, helper ? helperId : undefined].filter(Boolean).join(' ') || undefined;

  const handleValueChange = (value: string) => {
    if (fieldError.shown) fieldError.dismiss();
    onValueChange?.(value);
  };
  const handleAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    motion.handleAnimationEnd(event);
    onAnimationEnd?.(event);
  };

  return (
    <div
      ref={attach}
      className={['ui-radio-group', className, motion.className].filter(Boolean).join(' ')}
      style={{ ...style, ...motion.style }}
      data-variant={variant}
      data-orientation={orientation}
      data-error={fieldError.shown ? '' : undefined}
      data-disabled={disabled ? '' : undefined}
      onAnimationEnd={handleAnimationEnd}
    >
      {label && (
        <span id={labelId} className="ui-radio-group-label">
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </span>
      )}
      <RadixRadioGroup.Root
        ref={group}
        id={id}
        className="ui-radio-group-options"
        orientation={orientation}
        required={required}
        disabled={disabled}
        aria-labelledby={label ? labelId : undefined}
        aria-describedby={describedBy}
        aria-invalid={fieldError.shown || undefined}
        onValueChange={handleValueChange}
        {...attributes}
      >
        {options.map((option, index) => {
          const itemId = `${id}-option-${index}`;
          return (
            <label key={option.value} htmlFor={itemId} className="ui-radio-option" data-disabled={option.disabled ? '' : undefined}>
              <RadixRadioGroup.Item
                id={itemId}
                value={option.value}
                disabled={option.disabled}
                className="ui-radio-control"
                aria-labelledby={`${itemId}-label`}
                aria-describedby={option.helperText ? `${itemId}-helper` : undefined}
              >
                <RadixRadioGroup.Indicator className="ui-radio-dot" />
              </RadixRadioGroup.Item>
              <span className="ui-radio-option-text">
                {variant === 'card' && option.icon && (
                  <span className="ui-radio-option-icon">
                    <Icon name={option.icon} size={OPTION_ICON_SIZE} />
                  </span>
                )}
                <span id={`${itemId}-label`} className="ui-radio-option-label">
                  {option.label}
                </span>
                {option.helperText && (
                  <span id={`${itemId}-helper`} className="ui-radio-option-helper">
                    {option.helperText}
                  </span>
                )}
              </span>
            </label>
          );
        })}
      </RadixRadioGroup.Root>
      {helper && (
        <p id={helperId} className="ui-radio-group-helper">
          {helper}
        </p>
      )}
    </div>
  );
}
