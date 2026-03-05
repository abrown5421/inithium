import React from 'react';
import {
  Listbox as HeadlessUIListbox,
  ListboxButton as HeadlessUIListboxButton,
  ListboxOptions as HeadlessUIListboxOptions,
  ListboxOption as HeadlessUIListboxOption,
} from '@headlessui/react';
import { cn } from '@inithium/theme';
import { inputVariants } from '../../utils/variants.js';
import type { IListboxOption, IListboxProps } from './listbox.types.js';

export function Listbox<T = string>(props: IListboxProps<T>): React.JSX.Element {
  const {
    label,
    hint,
    error,
    required,
    id,
    className,
    value,
    onChange,
    options,
    placeholder,
    disabled,
    size,
  } = props;

  const listboxId = id;
  const hasError = Boolean(error);

  const selectedOption: IListboxOption<T> | undefined = options.find(
    (option) => option.value === value,
  );

  return (
    <div className="field-wrapper">
      {label ? (
        <label htmlFor={listboxId} className="field-label">
          {label}
          {required ? <span className="text-destructive">*</span> : null}
        </label>
      ) : null}

      <HeadlessUIListbox value={value} onChange={onChange} disabled={disabled}>
        <div className="relative">
          <HeadlessUIListboxButton
            id={listboxId}
            className={cn(
              inputVariants({
                size,
              }),
              'flex items-center justify-between',
              className,
            )}
          >
            <span className="truncate">
              {selectedOption
                ? selectedOption.label
                : placeholder ?? 'Select an option'}
            </span>
            <span className="ml-2 text-xs text-muted-foreground">▾</span>
          </HeadlessUIListboxButton>

          <HeadlessUIListboxOptions className="popover-panel mt-1 max-h-60 overflow-auto">
            {options.map((option) => (
              <HeadlessUIListboxOption
                key={String(option.value)}
                value={option.value}
                disabled={option.disabled}
                className={({ active, selected }) =>
                  cn(
                    'relative flex w-full cursor-default select-none items-center justify-between px-3 py-2 text-sm text-foreground transition-colors',
                    'data-[focus]:bg-muted',
                    'data-[disabled]:opacity-50 data-[disabled]:pointer-events-none',
                    active ? 'bg-muted' : null,
                    selected ? 'font-medium' : null,
                  )
                }
              >
                {({ selected }) => (
                  <>
                    <span className="truncate">{option.label}</span>
                    {selected ? <span className="ml-2 text-xs">✓</span> : null}
                  </>
                )}
              </HeadlessUIListboxOption>
            ))}
          </HeadlessUIListboxOptions>
        </div>
      </HeadlessUIListbox>

      {!hasError && hint ? <p className="field-hint">{hint}</p> : null}
      {hasError ? <p className="field-error">{error}</p> : null}
    </div>
  );
}

