import React from 'react';
import { Checkbox as HeadlessCheckbox } from '@headlessui/react';
import { cn } from '../lib/cn.js';

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: React.ReactNode;
  indeterminate?: boolean;
  disabled?: boolean;
  className?: string;
}

const CheckIcon: React.FC = () => (
  <svg
    className="size-3 text-white stroke-[2.5]"
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IndeterminateIcon: React.FC = () => (
  <svg
    className="size-3 text-white stroke-[2.5]"
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M2.5 6h7" stroke="currentColor" strokeLinecap="round" />
  </svg>
);

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  label,
  description,
  indeterminate = false,
  disabled = false,
  className,
}) => {
  const box = (
    <HeadlessCheckbox
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      indeterminate={indeterminate}
      className={cn(
        'size-4 shrink-0 rounded-(--radius-sm) border',
        'inline-flex items-center justify-center',
        'transition-all duration-150 ease-out',
        'focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-(--color-brand-500) focus-visible:ring-offset-2',
        'cursor-pointer disabled:cursor-not-allowed disabled:opacity-50',
        checked || indeterminate
          ? 'bg-(--color-brand-600) border-(--color-brand-600)'
          : 'bg-(--ui-bg) border-(--ui-border) hover:border-(--color-brand-400)',
      )}
    >
      {indeterminate ? <IndeterminateIcon /> : checked ? <CheckIcon /> : null}
    </HeadlessCheckbox>
  );

  if (!label) return box;

  return (
    <label
      className={cn(
        'flex items-start gap-2.5 cursor-pointer',
        disabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
    >
      <div className="mt-0.5">{box}</div>
      <div className="flex flex-col">
        <span className="text-sm font-medium text-(--ui-text) leading-none">{label}</span>
        {description && (
          <span className="text-xs text-(--ui-text-muted) mt-1">{description}</span>
        )}
      </div>
    </label>
  );
};
