import React from 'react';
import { Checkbox as HeadlessCheckbox } from '@headlessui/react';
import { cn, INTERACTIVE_COLOR_MAP } from '@inithium/utils';
import type { ThemeColor, ComponentSize } from '@inithium/types';
import type { CheckboxProps } from './checkbox.types';

const CHECKBOX_SIZE_MAP: Record<ComponentSize, string> = {
  sm: 'size-3.5',
  base: 'size-4',
  lg: 'size-5',
  xl: 'size-6',
};

const LABEL_SIZE_MAP: Record<ComponentSize, string> = {
  sm: 'text-xs',
  base: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg',
};

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={cn('w-full h-full', className)}
    viewBox="0 0 16 16"
    fill="none"
  >
    <path
      d="M3.5 8l3 3 6-6"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  label,
  description,
  color = 'primary',
  size = 'base',
  disabled = false,
  className = '',
  checkboxClassName = '',
  labelClassName = '',
  descriptionClassName = '',
  name,
  value,
}) => {
  const c = INTERACTIVE_COLOR_MAP[color as ThemeColor];

  const renderIcon = ({ checked: isChecked }: { checked: boolean }) =>
    isChecked ? <CheckIcon className={c.textContrast} /> : <span />;

  return (
    <label
      className={cn(
        'flex items-start gap-3 cursor-pointer',
        disabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
    >
      <HeadlessCheckbox
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        name={name}
        value={value}
        className={cn(
          'mt-0.5 flex-shrink-0 rounded border-2 transition duration-200 focus:outline-none data-[focus]:ring-2 data-[focus]:ring-offset-2',
          CHECKBOX_SIZE_MAP[size as ComponentSize],
          c.border,
          `data-[checked]:${c.bg}`,
          'data-[checked]:border-transparent',
          checkboxClassName,
        )}
      >
        {renderIcon}
      </HeadlessCheckbox>

      {(label || description) && (
        <span className="flex flex-col gap-0.5">
          {label && (
            <span
              className={cn(
                LABEL_SIZE_MAP[size as ComponentSize],
                'font-medium text-on-surface',
                labelClassName,
              )}
            >
              {label}
            </span>
          )}
          {description && (
            <span
              className={cn(
                'text-xs text-on-surface/60',
                descriptionClassName,
              )}
            >
              {description}
            </span>
          )}
        </span>
      )}
    </label>
  );
};