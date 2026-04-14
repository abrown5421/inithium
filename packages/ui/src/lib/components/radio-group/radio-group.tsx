import React from 'react';
import {
  RadioGroup as HeadlessRadioGroup,
  Radio,
  Label,
  Description,
  Field,
} from '@headlessui/react';
import { cn, INTERACTIVE_COLOR_MAP, COMPONENT_SIZE_MAP } from '@inithium/utils';
import { Icon } from '../icon/icon';
import type { ThemeColor, ComponentSize } from '@inithium/types';
import type { RadioGroupVariant, RadioGroupProps } from './radio-group.types';

const RADIO_SIZE_MAP: Record<ComponentSize, string> = {
  sm: 'w-4 h-4',
  base: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-7 h-7',
};

const ICON_SIZE_MAP: Record<ComponentSize, any> = {
  sm: 'xs',
  base: 'sm',
  lg: 'base',
  xl: 'lg',
};

const getVariantStyles = (variant: RadioGroupVariant, color: ThemeColor): string => {
  const c = INTERACTIVE_COLOR_MAP[color];
  const common = 'border-2 rounded-full transition-all duration-200 flex items-center justify-center focus:outline-none data-[focus]:ring-2 data-[focus]:ring-offset-2';

  const styles: Record<RadioGroupVariant, string> = {
    filled: cn(
      common,
      c.border,
      'data-[checked]:border-transparent',
      `data-[checked]:${c.bg}`,
    ),
    outlined: cn(
      common,
      c.border,
      `data-[checked]:${c.border}`,
    ),
    ghost: cn(
      common,
      'border-on-surface/30',
      `data-[checked]:${c.border}`,
    ),
  };

  return styles[variant];
};

export const RadioGroup: React.FC<RadioGroupProps> = ({
  options,
  value,
  onChange,
  variant = 'filled',
  orientation = 'vertical',
  size = 'base',
  color = 'primary',
  label,
  description,
  className = '',
  labelClassName = '',
  descriptionClassName = '',
  optionClassName = '',
  radioClassName = '',
  optionLabelClassName = '',
  optionDescriptionClassName = '',
  disabled = false,
  name,
}) => {
  return (
    <HeadlessRadioGroup
      value={value}
      onChange={onChange}
      disabled={disabled}
      name={name}
      className={cn('flex flex-col gap-2', disabled && 'opacity-50', className)}
    >
      {label && (
        <Label className={cn('font-semibold text-on-surface', COMPONENT_SIZE_MAP[size], labelClassName)}>
          {label}
        </Label>
      )}

      {description && (
        <Description className={cn('text-xs text-on-surface/60 -mt-1', descriptionClassName)}>
          {description}
        </Description>
      )}

      <div className={cn('flex gap-3', orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap')}>
        {options.map((option) => (
          <Field key={option.value} disabled={option.disabled} className={cn('flex items-start gap-3', optionClassName)}>
            <Radio
              value={option.value}
              className={cn(
                'mt-0.5 flex-shrink-0 cursor-pointer disabled:cursor-not-allowed',
                RADIO_SIZE_MAP[size],
                getVariantStyles(variant, color as ThemeColor),
                radioClassName,
              )}
            >
              {({ checked }) => (
                <Icon
                  name={option.iconName}
                  size={ICON_SIZE_MAP[size]}
                  // Pass theme color if not filled (where text-white is forced)
                  color={variant === 'filled' ? undefined : (color as ThemeColor)}
                  className={cn(
                    'transition-all duration-200 transform',
                    checked ? 'opacity-100 scale-100' : 'opacity-0 scale-50',
                    variant === 'filled' && 'text-white',
                  )}
                />
              )}
            </Radio>
            <span className="flex flex-col gap-0.5">
              <Label className={cn('font-medium text-on-surface cursor-pointer', COMPONENT_SIZE_MAP[size], option.disabled && 'opacity-50 cursor-not-allowed', optionLabelClassName)}>
                {option.label}
              </Label>
              {option.description && (
                <Description className={cn('text-xs text-on-surface/60', optionDescriptionClassName)}>
                  {option.description}
                </Description>
              )}
            </span>
          </Field>
        ))}
      </div>
    </HeadlessRadioGroup>
  );
};