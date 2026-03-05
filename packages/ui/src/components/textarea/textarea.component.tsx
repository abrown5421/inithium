import React from 'react';
import { Textarea as HeadlessUITextarea } from '@headlessui/react';
import { cn } from '@inithium/theme';
import type { ITextareaProps } from './textarea.types.js';

export function Textarea(props: ITextareaProps): React.JSX.Element {
  const {
    label,
    hint,
    error,
    required,
    id,
    className,
    placeholder,
    value,
    onChange,
    disabled,
    rows,
    name,
  } = props;

  const textareaId = id;
  const hasError = Boolean(error);

  return (
    <div className="field-wrapper">
      {label ? (
        <label htmlFor={textareaId} className="field-label">
          {label}
          {required ? <span className="text-destructive">*</span> : null}
        </label>
      ) : null}

      <HeadlessUITextarea
        id={textareaId}
        placeholder={placeholder}
        value={value}
        name={name}
        disabled={disabled}
        rows={rows}
        className={cn('input-base resize-y', className)}
        onInput={(event) => onChange?.((event.currentTarget as HTMLTextAreaElement).value)}
      />

      {!hasError && hint ? <p className="field-hint">{hint}</p> : null}
      {hasError ? <p className="field-error">{error}</p> : null}
    </div>
  );
}

