import {
  Fragment,
  useCallback,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type AnimationEvent,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type Ref,
} from 'react';
import * as RadixSelect from '@radix-ui/react-select';
import {
  inputStylePropsSchema,
  type InputStyleProps,
  type SelectSerializableProps,
} from '@inithium/shared-contracts';
import { useAnimation, type AnimationRuntimeProps } from '../animation/use-animation.hook';
import { useDismissibleError } from '../form-field/use-dismissible-error.hook';
import { useTextStart } from '../form-field/use-text-start.hook';
import { Icon, type IconName } from '../icon/icon.component';
import { InputAdornment } from '../input/input-adornment.component';
import { splitStyleProps } from '../style-props/split-style-props.service';
import { resolveInputStyles } from '../style-props/style-props.service';

// The field takes Input's style props (decision 0062).
const styleKeys = new Set(Object.keys(inputStylePropsSchema.shape) as (keyof InputStyleProps)[]);

/** Icon size in the field and the list, in px. */
const ICON_SIZE = 16;

/** One choice in a Select, with its icon typed as Lucide's names. */
export type SelectChoice = { value: string; label: string; icon?: IconName; disabled?: boolean };
/** Choices shown together under a heading. */
export type SelectChoiceGroup = { label: string; options: SelectChoice[] };

export type SelectProps = Omit<SelectSerializableProps, 'options' | 'leadingIcon'> &
  AnimationRuntimeProps &
  Omit<ComponentPropsWithoutRef<typeof RadixSelect.Root>, 'children' | 'dir'> & {
    options: (SelectChoice | SelectChoiceGroup)[];
    /** A decorative Lucide icon before the value. */
    leadingIcon?: IconName;
    /** Marks the field invalid. A message replaces helperText while shown. Choosing an option hides it. */
    error?: boolean | string;
    id?: string;
    'aria-label'?: string;
    'aria-describedby'?: string;
    /** Fires when the wrapper's animation ends. */
    onAnimationEnd?: (event: AnimationEvent<HTMLDivElement>) => void;
    ref?: Ref<HTMLButtonElement>;
  };

const isGroup = (entry: SelectChoice | SelectChoiceGroup): entry is SelectChoiceGroup => 'options' in entry;

/**
 * A field for choosing one option from a list (decisions 0056 and 0062): Radix's accessible select, drawn as an
 * Input field (outlined, filled or standard, with a floating label, helper text and errors) that opens a list
 * below it. Options are data, optionally grouped under headings. `ref` reaches the field (a button).
 */
export function Select(props: SelectProps) {
  const [styleProps, rest] = splitStyleProps(props, styleKeys);
  const {
    id: idProp,
    options,
    label,
    placeholder,
    helperText,
    error,
    required,
    disabled,
    leadingIcon,
    value,
    defaultValue,
    onValueChange,
    open,
    onOpenChange,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    animation,
    show,
    replay,
    onEntranceEnd,
    onExitEnd,
    ref,
    onAnimationEnd,
    ...rootProps
  } = rest;

  const generatedId = useId();
  const id = idProp ?? generatedId;
  const helperId = `${id}-helper`;
  const trigger = useRef<HTMLButtonElement>(null);
  const text = useRef<HTMLSpanElement>(null);
  const start = useRef<HTMLSpanElement>(null);

  // Mirrors of Radix's state, for the field's look: whether it has a value, is focused, or is open.
  const [chosen, setChosen] = useState(defaultValue);
  const [focused, setFocused] = useState(false);
  const [listOpen, setListOpen] = useState(false);

  const motion = useAnimation({ animation, show, replay, onEntranceEnd, onExitEnd });
  const { mounted, attach, getElement } = motion;
  useImperativeHandle(ref, () => trigger.current as HTMLButtonElement);
  const getForm = useCallback(() => trigger.current?.form, []);
  const fieldError = useDismissibleError(error, getForm, mounted);
  useTextStart(getElement, text, start, mounted, Boolean(leadingIcon));

  if (!mounted) return null;

  const variant = styleProps.variant ?? 'outlined';
  const { root, field, accent } = resolveInputStyles(styleProps, fieldError.shown);
  const isOpen = open ?? listOpen;
  const filled = Boolean(value ?? chosen);
  const helper = fieldError.message ?? helperText;
  const describedBy = [ariaDescribedBy, helper ? helperId : undefined].filter(Boolean).join(' ') || undefined;
  const labelContent = label && (
    <>
      {label}
      {required && <span aria-hidden="true"> *</span>}
    </>
  );

  const handleValueChange = (next: string) => {
    if (fieldError.shown) fieldError.dismiss();
    setChosen(next);
    onValueChange?.(next);
  };
  const handleOpenChange = (next: boolean) => {
    setListOpen(next);
    onOpenChange?.(next);
  };
  const handleAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    motion.handleAnimationEnd(event);
    onAnimationEnd?.(event);
  };

  return (
    <div
      ref={attach}
      className={['ui-input', root.className, motion.className].filter(Boolean).join(' ')}
      style={{ ...root.style, ...motion.style }}
      data-variant={variant}
      data-has-label={label ? '' : undefined}
      data-label-above={label && variant !== 'outlined' ? '' : undefined}
      data-error={fieldError.shown ? '' : undefined}
      data-disabled={disabled ? '' : undefined}
      data-active={focused || isOpen ? '' : undefined}
      data-filled={filled ? '' : undefined}
      data-open={isOpen ? '' : undefined}
      onAnimationEnd={handleAnimationEnd}
    >
      <RadixSelect.Root
        value={value}
        defaultValue={defaultValue}
        onValueChange={handleValueChange}
        open={open}
        onOpenChange={handleOpenChange}
        required={required}
        disabled={disabled}
        {...rootProps}
      >
        <RadixSelect.Trigger
          ref={trigger}
          id={id}
          className={['ui-input-field', 'ui-select-trigger', field.className].filter(Boolean).join(' ')}
          style={field.style}
          aria-label={ariaLabel}
          aria-describedby={describedBy}
          aria-invalid={fieldError.shown || undefined}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        >
          {leadingIcon && (
            <span ref={start} className="ui-input-adornments">
              <InputAdornment icon={leadingIcon} />
            </span>
          )}
          <span ref={text} className="ui-select-value">
            <RadixSelect.Value placeholder={placeholder} />
          </span>
          <RadixSelect.Icon className="ui-select-chevron">
            <Icon name="chevron-down" size={ICON_SIZE} />
          </RadixSelect.Icon>
          {variant === 'outlined' && (
            <fieldset aria-hidden="true" className="ui-input-outline">
              <legend>{labelContent && <span>{labelContent}</span>}</legend>
            </fieldset>
          )}
        </RadixSelect.Trigger>
        <RadixSelect.Portal>
          <RadixSelect.Content
            className="ui-select-content"
            position="popper"
            sideOffset={4}
            style={{ '--ui-input-accent': accent } as CSSProperties}
          >
            <RadixSelect.ScrollUpButton className="ui-select-scroll">
              <Icon name="chevron-up" size={ICON_SIZE} />
            </RadixSelect.ScrollUpButton>
            <RadixSelect.Viewport className="ui-select-viewport">
              {options.map((entry, index) =>
                isGroup(entry) ? (
                  <Fragment key={`group-${entry.label}`}>
                    {index > 0 && <RadixSelect.Separator className="ui-select-separator" />}
                    <RadixSelect.Group>
                      <RadixSelect.Label className="ui-select-group-label">{entry.label}</RadixSelect.Label>
                      {entry.options.map((option) => (
                        <SelectRow key={option.value} option={option} />
                      ))}
                    </RadixSelect.Group>
                  </Fragment>
                ) : (
                  <SelectRow key={entry.value} option={entry} />
                ),
              )}
            </RadixSelect.Viewport>
            <RadixSelect.ScrollDownButton className="ui-select-scroll">
              <Icon name="chevron-down" size={ICON_SIZE} />
            </RadixSelect.ScrollDownButton>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>
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
  );
}

/** One row in the list: an optional icon, the label, and a check when chosen. */
function SelectRow({ option }: { option: SelectChoice }) {
  return (
    <RadixSelect.Item value={option.value} disabled={option.disabled} className="ui-select-item">
      {option.icon && (
        <span className="ui-select-item-icon">
          <Icon name={option.icon} size={ICON_SIZE} />
        </span>
      )}
      <RadixSelect.ItemText asChild>
        <span className="ui-select-item-text">{option.label}</span>
      </RadixSelect.ItemText>
      <RadixSelect.ItemIndicator className="ui-select-item-check">
        <Icon name="check" size={ICON_SIZE} />
      </RadixSelect.ItemIndicator>
    </RadixSelect.Item>
  );
}
