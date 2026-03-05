import React from 'react';
import { Input as HeadlessUIInput } from '@headlessui/react';
import { cn } from '@inithium/theme';
import { inputVariants } from '../../utils/variants.js';
import type { IInputProps } from './input.types.js';

export function Input(props: IInputProps): React.JSX.Element {
  const {
    label,
    hint,
    error,
    required,
    id,
    className,
    type = 'text',
    placeholder,
    value,
    onChange,
    disabled,
    variant,
    size,
    name,
  } = props;

  const inputId = id;
  const hasError = Boolean(error);

  return (
    <div className="field-wrapper">
      {label ? (
        <label htmlFor={inputId} className="field-label">
          {label}
          {required ? <span className="text-destructive">*</span> : null}
        </label>
      ) : null}

      <HeadlessUIInput
        id={inputId}
        type={type}
        placeholder={placeholder}
        value={value}
        name={name}
        disabled={disabled}
        className={cn(
          inputVariants({
            variant: hasError ? 'error' : variant,
            size,
          }),
          className,
        )}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          onChange?.(event.target.value)
        }
      />

      {!hasError && hint ? <p className="field-hint">{hint}</p> : null}
      {hasError ? <p className="field-error">{error}</p> : null}
    </div>
  );
}

