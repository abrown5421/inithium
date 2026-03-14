import React, { useState } from 'react';
import {
  Combobox as HeadlessCombobox,
  ComboboxInput,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption,
} from '@headlessui/react';
import { cn } from '../lib/cn.js';

export interface ComboboxOption<T = string> {
  value: T;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface ComboboxProps<T = string> {
  value: T | null;
  onChange: (value: T | null) => void;
  options: ComboboxOption<T>[];
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  nullable?: boolean;
  className?: string;
}

const ChevronIcon: React.FC = () => (
  <svg
    className="size-4 text-(--ui-text-muted)"
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

export function Combobox<T = string>({
  value,
  onChange,
  options,
  placeholder = 'Search…',
  label,
  error,
  disabled = false,
  className,
}: ComboboxProps<T>) {
  const [query, setQuery] = useState('');

  const filtered =
    query === ''
      ? options
      : options.filter((o) =>
          o.label.toLowerCase().includes(query.toLowerCase()),
        );

  const displayValue = (val: T | null): string => {
    if (!val) return '';
    return options.find((o) => o.value === val)?.label ?? '';
  };

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {label && (
        <label className="text-sm font-medium text-(--ui-text)">{label}</label>
      )}
      <HeadlessCombobox value={value} onChange={onChange} disabled={disabled}>
        <div className="relative">
          <ComboboxInput
            displayValue={displayValue}
            onChange={(e) => setQuery(e.target.value)}
            onBlur={() => setQuery('')}
            placeholder={placeholder}
            className={cn(
              'w-full h-9 pl-3 pr-8 rounded-(--radius-md) text-sm',
              'bg-(--ui-bg) border',
              'text-(--ui-text) placeholder:text-(--ui-text-muted)',
              'transition-all duration-150',
              'focus:outline-none focus-visible:ring-2',
              'focus-visible:ring-(--color-brand-500) focus-visible:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error ? 'border-(--color-danger-600)' : 'border-(--ui-border) hover:border-(--color-brand-400)',
            )}
          />
          <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronIcon />
          </ComboboxButton>
        </div>

        <ComboboxOptions
          transition
          anchor="bottom start"
          className={cn(
            'z-50 mt-1 w-[var(--input-width)] rounded-(--radius-lg)',
            'bg-(--ui-bg) border border-(--ui-border)',
            'shadow-lg shadow-black/10',
            'p-1 max-h-60 overflow-auto empty:hidden',
            'transition-all duration-150 ease-out',
            'data-[closed]:opacity-0 data-[closed]:-translate-y-1',
            'focus:outline-none',
          )}
        >
          {filtered.length === 0 && (
            <p className="px-3 py-6 text-sm text-center text-(--ui-text-muted)">
              No results found.
            </p>
          )}
          {filtered.map((option, idx) => (
            <ComboboxOption
              key={idx}
              value={option.value}
              disabled={option.disabled}
              className={cn(
                'flex items-center gap-2 px-2 py-1.5 rounded-(--radius-md) text-sm',
                'cursor-pointer transition-colors duration-100',
                'text-(--ui-text) data-[focus]:bg-(--ui-bg-subtle)',
                option.disabled && 'opacity-40 cursor-not-allowed',
              )}
            >
              {({ selected }) => (
                <>
                  <span className="flex-1">
                    <span className="block font-medium">{option.label}</span>
                    {option.description && (
                      <span className="block text-xs text-(--ui-text-muted)">{option.description}</span>
                    )}
                  </span>
                  {selected && (
                    <span className="text-(--color-brand-600) shrink-0">
                      <CheckIcon />
                    </span>
                  )}
                </>
              )}
            </ComboboxOption>
          ))}
        </ComboboxOptions>
      </HeadlessCombobox>
      {error && <p className="text-xs text-(--color-danger-600)">{error}</p>}
    </div>
  );
}
