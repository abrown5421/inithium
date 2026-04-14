import React from 'react';
import { Textarea as HeadlessTextarea, Field, Label, Description } from '@headlessui/react';
import { cn, INTERACTIVE_COLOR_MAP, COMPONENT_SIZE_MAP } from '@inithium/utils';
import type { ThemeColor, ComponentSize } from '@inithium/types';
import type { TextareaVariant, TextareaResize, TextareaProps } from './textarea.types';

const TEXTAREA_SIZE_MAP: Record<ComponentSize, string> = {
  sm: 'px-2.5 py-1.5 text-xs',
  base: 'px-3 py-2 text-sm',
  lg: 'px-4 py-3 text-base',
  xl: 'px-5 py-3.5 text-lg',
};

const LABEL_SIZE_MAP: Record<ComponentSize, string> = {
  sm: 'text-xs',
  base: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg',
};

const RESIZE_MAP: Record<TextareaResize, string> = {
  none: 'resize-none',
  vertical: 'resize-y',
  horizontal: 'resize-x',
  both: 'resize',
};

const getVariantStyles = (variant: TextareaVariant, color: ThemeColor, invalid: boolean): string => {
  const c = INTERACTIVE_COLOR_MAP[color];

  if (invalid) {
    const danger = INTERACTIVE_COLOR_MAP['danger'];
    return cn('border-2', danger.border, 'bg-surface text-on-surface', 'focus:outline-none data-[focus]:ring-2 data-[focus]:ring-offset-1');
  }

  const styles: Record<TextareaVariant, string> = {
    filled: cn(
      'border-2 border-transparent',
      c.bg,
      c.textContrast,
      'placeholder:opacity-60',
      'focus:outline-none data-[focus]:ring-2 data-[focus]:ring-offset-1',
      `data-[focus]:${c.border}`,
    ),
    outlined: cn(
      'border-2 bg-surface text-on-surface',
      c.border,
      'placeholder:text-on-surface/40',
      'focus:outline-none data-[focus]:ring-2 data-[focus]:ring-offset-1',
      `data-[focus]:${c.border}`,
    ),
    ghost: cn(
      'border-0 border-b-2 rounded-none bg-transparent text-on-surface',
      c.border,
      'placeholder:text-on-surface/40',
      'focus:outline-none',
      `data-[focus]:${c.border}`,
    ),
  };

  return styles[variant];
};

export const Textarea: React.FC<TextareaProps> = ({
  variant = 'outlined',
  size = 'base',
  color = 'primary',
  label,
  description,
  error,
  resize = 'vertical',
  showCharCount = false,
  maxLength,
  className = '',
  textareaClassName = '',
  labelClassName = '',
  descriptionClassName = '',
  errorClassName = '',
  wrapperClassName = '',
  invalid = false,
  disabled = false,
  rows = 4,
  value,
  onChange,
  ...props
}) => {
  const charCount = typeof value === 'string' ? value.length : 0;

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

      <div className={cn('relative', wrapperClassName)}>
        <HeadlessTextarea
          rows={rows}
          invalid={invalid}
          disabled={disabled}
          maxLength={maxLength}
          value={value}
          onChange={onChange}
          className={cn(
            'w-full rounded-md transition duration-200 disabled:cursor-not-allowed',
            TEXTAREA_SIZE_MAP[size as ComponentSize],
            getVariantStyles(variant, color as ThemeColor, invalid),
            RESIZE_MAP[resize],
            variant === 'ghost' && 'rounded-none',
            textareaClassName,
          )}
          {...props}
        />
      </div>

      <div className="flex items-start justify-between gap-2">
        <span className="flex-1">
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
        </span>

        {showCharCount && (
          <span
            className={cn(
              'text-xs flex-shrink-0',
              maxLength && charCount >= maxLength
                ? INTERACTIVE_COLOR_MAP['danger'].text
                : 'text-on-surface/50',
            )}
          >
            {charCount}
            {maxLength && <span>/{maxLength}</span>}
          </span>
        )}
      </div>
    </Field>
  );
};