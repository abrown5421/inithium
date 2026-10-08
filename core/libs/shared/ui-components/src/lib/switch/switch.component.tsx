import {
  useCallback,
  useId,
  useImperativeHandle,
  useRef,
  type AnimationEvent,
  type ComponentPropsWithoutRef,
  type Ref,
} from 'react';
import * as RadixSwitch from '@radix-ui/react-switch';
import {
  switchStylePropsSchema,
  type SwitchSerializableProps,
  type SwitchStyleProps,
} from '@inithium/shared-contracts';
import { useAnimation, type AnimationRuntimeProps } from '../animation/use-animation.hook';
import { useDismissibleError } from '../form-field/use-dismissible-error.hook';
import { Icon, type IconName } from '../icon/icon.component';
import { splitStyleProps } from '../style-props/split-style-props.service';
import { resolveSwitchStyles } from '../style-props/style-props.service';

const styleKeys = new Set(Object.keys(switchStylePropsSchema.shape) as (keyof SwitchStyleProps)[]);

/** Icon size on the 16px thumb, in px. */
const THUMB_ICON_SIZE = 12;

export type SwitchProps = Omit<SwitchSerializableProps, 'checkedIcon' | 'uncheckedIcon'> &
  AnimationRuntimeProps &
  Omit<
    ComponentPropsWithoutRef<typeof RadixSwitch.Root>,
    'className' | 'style' | 'color' | 'children' | 'asChild' | 'onAnimationEnd'
  > & {
    /** A Lucide icon on the thumb while on. */
    checkedIcon?: IconName;
    /** A Lucide icon on the thumb while off. */
    uncheckedIcon?: IconName;
    /** Marks the switch invalid. A message replaces helperText while shown. Toggling it hides it. */
    error?: boolean | string;
    /** Fires when the wrapper's animation ends. */
    onAnimationEnd?: (event: AnimationEvent<HTMLDivElement>) => void;
    ref?: Ref<HTMLButtonElement>;
  };

/**
 * An on/off switch (decisions 0056 and 0059): Radix's accessible switch, neutral when off and filled with one
 * colour when on, with optional thumb icons, a label on either side, helper text and an error state. `ref`
 * reaches the track (a <button role="switch">).
 */
export function Switch(props: SwitchProps) {
  const [styleProps, rest] = splitStyleProps(props, styleKeys);
  const {
    id: idProp,
    label,
    labelPlacement = 'end',
    helperText,
    error,
    required,
    disabled,
    checkedIcon,
    uncheckedIcon,
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
  const track = useRef<HTMLButtonElement>(null);

  const motion = useAnimation({ animation, show, replay, onEntranceEnd, onExitEnd });
  const { mounted, attach } = motion;
  useImperativeHandle(ref, () => track.current as HTMLButtonElement);
  const getForm = useCallback(() => track.current?.form, []);
  const fieldError = useDismissibleError(error, getForm, mounted);

  if (!mounted) return null;

  const { className, style } = resolveSwitchStyles(styleProps, fieldError.shown);
  const helper = fieldError.message ?? helperText;
  const describedBy = [ariaDescribedBy, helper ? helperId : undefined].filter(Boolean).join(' ') || undefined;

  const handleCheckedChange = (checked: boolean) => {
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
      className={['ui-switch', className, motion.className].filter(Boolean).join(' ')}
      style={{ ...style, ...motion.style }}
      data-label-placement={labelPlacement}
      data-error={fieldError.shown ? '' : undefined}
      data-disabled={disabled ? '' : undefined}
      onAnimationEnd={handleAnimationEnd}
    >
      <div className="ui-switch-row">
        <RadixSwitch.Root
          ref={track}
          id={id}
          className="ui-switch-track"
          required={required}
          disabled={disabled}
          aria-invalid={fieldError.shown || undefined}
          aria-describedby={describedBy}
          onCheckedChange={handleCheckedChange}
          {...attributes}
        >
          {/* Both icons are rendered; the thumb's state shows one, so uncontrolled switches work too. */}
          <RadixSwitch.Thumb className="ui-switch-thumb">
            {checkedIcon && (
              <span className="ui-switch-icon-checked">
                <Icon name={checkedIcon} size={THUMB_ICON_SIZE} strokeWidth={3} />
              </span>
            )}
            {uncheckedIcon && (
              <span className="ui-switch-icon-unchecked">
                <Icon name={uncheckedIcon} size={THUMB_ICON_SIZE} strokeWidth={3} />
              </span>
            )}
          </RadixSwitch.Thumb>
        </RadixSwitch.Root>
        {label && (
          <label htmlFor={id} className="ui-switch-label">
            {label}
            {required && <span aria-hidden="true"> *</span>}
          </label>
        )}
      </div>
      {helper && (
        <p id={helperId} className="ui-switch-helper">
          {helper}
        </p>
      )}
    </div>
  );
}
