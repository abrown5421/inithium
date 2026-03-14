import React from 'react';
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from '@headlessui/react';
import { cn } from '../lib/cn.js';

export interface SelectOption<T = string> {
  value: T;
  label: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface SelectProps<T = string> {
  value: T | null;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

const ChevronIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={cn('size-4', className)}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const CheckIcon: React.FC = () => (
  <svg
    className="size-4"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export function Select<T = string>({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  label,
  error,
  disabled = false,
  className,
}: SelectProps<T>) {
  const selected = options.find((o) => o.value === value) ?? null;

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {label && (
        <label className="text-sm font-medium text-(--ui-text)">{label}</label>
      )}
      <Listbox value={value} onChange={onChange} disabled={disabled}>
        <ListboxButton
          className={cn(
            'relative flex w-full items-center justify-between gap-2',
            'h-9 px-3 rounded-(--radius-md) text-sm text-left',
            'bg-(--ui-bg) border',
            'transition-all duration-150',
            'focus:outline-none focus-visible:ring-2',
            'focus-visible:ring-(--color-brand-500) focus-visible:ring-offset-2',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error ? 'border-(--color-danger-600)' : 'border-(--ui-border) hover:border-(--color-brand-400)',
          )}
        >
          <span className={cn('flex items-center gap-2 flex-1 truncate', !selected && 'text-(--ui-text-muted)')}>
            {selected?.icon && <span className="size-4 shrink-0">{selected.icon}</span>}
            {selected ? selected.label : placeholder}
          </span>
          <ChevronIcon className="text-(--ui-text-muted) shrink-0" />
        </ListboxButton>

        <ListboxOptions
          transition
          anchor="bottom start"
          className={cn(
            'z-50 mt-1 w-[var(--button-width)] rounded-(--radius-lg)',
            'bg-(--ui-bg) border border-(--ui-border)',
            'shadow-lg shadow-black/10',
            'p-1 max-h-60 overflow-auto',
            'transition-all duration-150 ease-out',
            'data-[closed]:opacity-0 data-[closed]:-translate-y-1',
            'focus:outline-none',
          )}
        >
          {options.map((option, idx) => (
            <ListboxOption
              key={idx}
              value={option.value}
              disabled={option.disabled}
              className={cn(
                'flex items-center gap-2 px-2 py-1.5 rounded-(--radius-md) text-sm',
                'cursor-pointer transition-colors duration-100',
                'text-(--ui-text) data-[focus]:bg-(--ui-bg-subtle)',
                'data-[selected]:font-medium',
                option.disabled && 'opacity-40 cursor-not-allowed',
              )}
            >
              {({ selected: isSelected }) => (
                <>
                  {option.icon && <span className="size-4 shrink-0">{option.icon}</span>}
                  <span className="flex-1">
                    <span className="block">{option.label}</span>
                    {option.description && (
                      <span className="block text-xs text-(--ui-text-muted)">{option.description}</span>
                    )}
                  </span>
                  {isSelected && (
                    <span className="text-(--color-brand-600) shrink-0">
                      <CheckIcon />
                    </span>
                  )}
                </>
              )}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </Listbox>
      {error && <p className="text-xs text-(--color-danger-600)">{error}</p>}
    </div>
  );
}
