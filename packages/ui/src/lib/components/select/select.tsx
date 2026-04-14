import React from 'react';
import { Select as HeadlessSelect, Field, Label, Description } from '@headlessui/react';
import { cn, INTERACTIVE_COLOR_MAP, COMPONENT_SIZE_MAP } from '@inithium/utils';
import type { ThemeColor, ComponentSize } from '@inithium/types';
import type { SelectVariant, SelectProps } from './select.types';

const SELECT_SIZE_MAP: Record<ComponentSize, string> = {
  sm: 'pl-2.5 pr-8 py-1 text-xs',
  base: 'pl-3 pr-9 py-2 text-sm',
  lg: 'pl-4 pr-10 py-2.5 text-base',
  xl: 'pl-5 pr-11 py-3 text-lg',
};

const LABEL_SIZE_MAP: Record<ComponentSize, string> = {
  sm: 'text-xs',
  base: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg',
};

const CHEVRON_SIZE_MAP: Record<ComponentSize, string> = {
  sm: 'size-3',
  base: 'size-4',
  lg: 'size-5',
  xl: 'size-6',
};

const getVariantStyles = (variant: SelectVariant, color: ThemeColor, invalid: boolean): string => {
  const c = INTERACTIVE_COLOR_MAP[color];

  if (invalid) {
    const danger = INTERACTIVE_COLOR_MAP['danger'];
    return cn('border-2', danger.border, 'bg-surface text-on-surface', 'focus:outline-none data-[focus]:ring-2 data-[focus]:ring-offset-1');
  }

  const styles: Record<SelectVariant, string> = {
    filled: cn(
      'border-2 border-transparent',
      c.bg,
      c.textContrast,
      'focus:outline-none data-[focus]:ring-2 data-[focus]:ring-offset-1',
      `data-[focus]:${c.border}`,
    ),
    outlined: cn(
      'border-2 bg-surface text-on-surface',
      c.border,
      'focus:outline-none data-[focus]:ring-2 data-[focus]:ring-offset-1',
      `data-[focus]:${c.border}`,
    ),
    ghost: cn(
      'border-0 border-b-2 rounded-none bg-transparent text-on-surface',
      c.border,
      'focus:outline-none',
    ),
  };

  return styles[variant];
};

const ChevronIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={cn('pointer-events-none', className)} viewBox="0 0 16 16" fill="none">
    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Select: React.FC<SelectProps> = ({
  options,
  variant = 'outlined',
  size = 'base',
  color = 'primary',
  label,
  description,
  error,
  placeholder,
  className = '',
  selectClassName = '',
  labelClassName = '',
  descriptionClassName = '',
  errorClassName = '',
  wrapperClassName = '',
  invalid = false,
  disabled = false,
  leadingIcon,
  ...props
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

        <HeadlessSelect
          invalid={invalid}
          disabled={disabled}
          className={cn(
            'w-full appearance-none rounded-md transition duration-200 cursor-pointer disabled:cursor-not-allowed',
            SELECT_SIZE_MAP[size as ComponentSize],
            getVariantStyles(variant, color as ThemeColor, invalid),
            leadingIcon && 'pl-9',
            variant === 'ghost' && 'rounded-none',
            selectClassName,
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </HeadlessSelect>

        <span className={cn('absolute right-3 flex items-center pointer-events-none', c.text)}>
          <ChevronIcon className={CHEVRON_SIZE_MAP[size as ComponentSize]} />
        </span>
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