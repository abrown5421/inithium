import React from 'react';
import { Select as HeadlessUISelect } from '@headlessui/react';
import { cn } from '@inithium/theme';
import { inputVariants } from '../../utils/variants.js';
import type { ISelectProps } from './select.types.js';

export function Select<
  T extends string | number | readonly string[] = string
>(props: ISelectProps<T>): React.JSX.Element {
  const {
    label,
    hint,
    error,
    required,
    id,
    className,
    value,
    onChange,
    disabled,
    size,
    name,
    children,
  } = props;

  const hasError = Boolean(error);

  return (
    <div className="field-wrapper">
      {label && (
        <label htmlFor={id} className="field-label">
          {label}
          {required && <span className="text-destructive">*</span>}
        </label>
      )}

      <HeadlessUISelect
        id={id}
        name={name}
        disabled={disabled}
        value={value}
        onChange={(event) => {
          const nextValue = event.target.value as T;
          onChange?.(nextValue);
        }}
        className={cn(
          inputVariants({ size }),
          className
        )}
      >
        {children}
      </HeadlessUISelect>

      {!hasError && hint && <p className="field-hint">{hint}</p>}
      {hasError && <p className="field-error">{error}</p>}
    </div>
  );
}
