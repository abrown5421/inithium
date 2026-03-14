import React from 'react';
import { cn } from '../lib/cn.js';

type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  error?: string;
  inputSize?: InputSize;
  leftAdornment?: React.ReactNode;
  rightAdornment?: React.ReactNode;
  fullWidth?: boolean;
}

const sizeClasses: Record<InputSize, string> = {
  sm: 'h-7 text-xs px-2.5 rounded-(--radius-sm)',
  md: 'h-9 text-sm px-3 rounded-(--radius-md)',
  lg: 'h-11 text-base px-4 rounded-(--radius-md)',
};

const adornmentPaddingL: Record<InputSize, string> = {
  sm: 'pl-7',
  md: 'pl-9',
  lg: 'pl-11',
};

const adornmentPaddingR: Record<InputSize, string> = {
  sm: 'pr-7',
  md: 'pr-9',
  lg: 'pr-11',
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      description,
      error,
      inputSize = 'md',
      leftAdornment,
      rightAdornment,
      fullWidth = true,
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <div className={cn('flex flex-col gap-1', fullWidth && 'w-full')}>
        {label && (
          <label className="text-sm font-medium text-(--ui-text)">{label}</label>
        )}
        {description && !error && (
          <p className="text-xs text-(--ui-text-muted) -mt-0.5">{description}</p>
        )}
        <div className="relative">
          {leftAdornment && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-(--ui-text-muted)">
              <span className="size-4">{leftAdornment}</span>
            </div>
          )}
          <input
            ref={ref}
            disabled={disabled}
            className={cn(
              'w-full border bg-(--ui-bg) text-(--ui-text)',
              'placeholder:text-(--ui-text-muted)',
              'transition-all duration-150',
              'focus:outline-none focus-visible:ring-2',
              'focus-visible:ring-(--color-brand-500) focus-visible:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error
                ? 'border-(--color-danger-600) focus-visible:ring-(--color-danger-600)'
                : 'border-(--ui-border) hover:border-(--color-brand-400)',
              sizeClasses[inputSize],
              leftAdornment && adornmentPaddingL[inputSize],
              rightAdornment && adornmentPaddingR[inputSize],
              className,
            )}
            {...props}
          />
          {rightAdornment && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-(--ui-text-muted)">
              <span className="size-4">{rightAdornment}</span>
            </div>
          )}
        </div>
        {error && <p className="text-xs text-(--color-danger-600)">{error}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
