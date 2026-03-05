import React from 'react';
import { Checkbox as HeadlessUICheckbox } from '@headlessui/react';
import { cn } from '@inithium/theme';
import type { ICheckboxProps } from './checkbox.types.js';

export function Checkbox(props: ICheckboxProps): React.JSX.Element {
  const {
    label,
    hint,
    error,
    required,
    className,
    checked,
    onChange,
    disabled,
    indeterminate,
    name,
    value,
    id,
  } = props;

  const hasError = Boolean(error);

  return (
    <div className="field-wrapper">
      <div className="flex items-center gap-2">
        <HeadlessUICheckbox
          id={id}
          name={name}
          value={value}
          checked={checked}
          disabled={disabled}
          onChange={onChange}
          data-indeterminate={indeterminate ? 'true' : undefined}
          className={cn(
            'flex h-4 w-4 items-center justify-center rounded-[--radius-sm] border border-input bg-background',
            'data-[checked]:bg-primary data-[checked]:border-primary',
            'data-[indeterminate]:bg-primary/50 data-[indeterminate]:border-primary/50',
            'focus-visible:ring-2 focus-visible:ring-ring transition-colors',
            className,
          )}
        >
          {checked ? (
            <svg
              viewBox="0 0 16 16"
              aria-hidden="true"
              className="h-3 w-3 text-primary-foreground"
            >
              <path
                d="M12.207 4.207a1 1 0 0 0-1.414-1.414L6.5 7.086 5.207 5.793A1 1 0 0 0 3.793 7.207l2 2a1 1 0 0 0 1.414 0l5-5Z"
                fill="currentColor"
              />
            </svg>
          ) : null}
        </HeadlessUICheckbox>
        {label ? (
          <label htmlFor={id} className="field-label">
            {label}
            {required ? <span className="text-destructive">*</span> : null}
          </label>
        ) : null}
      </div>

      {!hasError && hint ? <p className="field-hint">{hint}</p> : null}
      {hasError ? <p className="field-error">{error}</p> : null}
    </div>
  );
}

