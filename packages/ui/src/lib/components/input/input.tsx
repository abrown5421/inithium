import React from 'react';
import { Field, Label, Description } from '@headlessui/react';
import { cn, INTERACTIVE_COLOR_MAP } from '@inithium/utils';
import type { ThemeColor, ComponentSize } from '@inithium/types';
import type { InputVariant, InputProps } from './input.types';

const INPUT_SIZE_MAP: Record<ComponentSize, string> = {
  sm: 'px-2.5 py-1 text-xs',
  base: 'px-3 py-2 text-sm',
  lg: 'px-4 py-2.5 text-base',
  xl: 'px-5 py-3 text-lg',
};

const LABEL_SIZE_MAP: Record<ComponentSize, string> = {
  sm: 'text-xs',
  base: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg',
};

const getVariantStyles = (variant: InputVariant, color: ThemeColor, invalid: boolean): string => {
  const c = INTERACTIVE_COLOR_MAP[color];

  if (invalid) {
    const danger = INTERACTIVE_COLOR_MAP['danger'];
    return cn(
      'border-2',
      danger.border,
      'bg-surface text-on-surface',
      'focus:outline-none focus:ring-2 focus:ring-offset-1',
      danger.border,
    );
  }

  const styles: Record<InputVariant, string> = {
    filled: cn(
      'border-2 border-transparent',
      c.bg,
      c.textContrast,
      'placeholder:opacity-60',
      'focus:outline-none focus:ring-2 focus:ring-offset-1',
      `focus:${c.border}`,
    ),
    outlined: cn(
      'border-2 bg-surface text-on-surface',
      c.border,
      'placeholder:text-on-surface/40',
      'focus:outline-none focus:ring-2 focus:ring-offset-1',
      `focus:${c.border}`,
    ),
    ghost: cn(
      'border-0 border-b-2 rounded-none bg-transparent text-on-surface',
      c.border,
      'placeholder:text-on-surface/40',
      'focus:outline-none',
      `focus:${c.border}`,
    ),
  };

  return styles[variant];
};

export const Input: React.FC<InputProps> = ({
  variant = 'outlined',
  size = 'base',
  color = 'primary',
  label,
  description,
  error,
  leadingIcon,
  trailingIcon,
  className = '',
  inputClassName = '',
  labelClassName = '',
  descriptionClassName = '',
  errorClassName = '',
  wrapperClassName = '',
  invalid = false,
  disabled = false,
  type = 'text',
  ...props
  // ...props now spreads React.InputHTMLAttributes<HTMLInputElement> minus
  // size/color — so onChange is typed as ChangeEventHandler<HTMLInputElement>
  // and e.target.value is fully available to all consumers.
}) => {
  const c = INTERACTIVE_COLOR_MAP[color as ThemeColor];

  return (
    <Field
      disabled={disabled}
      className={cn('flex flex-col gap-1', disabled && 'opacity-50', className)}
    >
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

      <div className={cn('relative flex items-center', wrapperClassName)}>
        {leadingIcon && (
          <span className={cn('absolute left-3 flex items-center pointer-events-none', c.text)}>
            {leadingIcon}
          </span>
        )}

        <input
          type={type}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          className={cn(
            'w-full rounded-md transition duration-200 disabled:cursor-not-allowed',
            INPUT_SIZE_MAP[size as ComponentSize],
            getVariantStyles(variant, color as ThemeColor, invalid),
            leadingIcon && 'pl-9',
            trailingIcon && 'pr-9',
            variant === 'ghost' && 'rounded-none',
            inputClassName,
          )}
          {...props}
        />

        {trailingIcon && (
          <span className={cn('absolute right-3 flex items-center pointer-events-none', c.text)}>
            {trailingIcon}
          </span>
        )}
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