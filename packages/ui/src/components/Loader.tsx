import React from 'react';
import { cn } from '../lib/cn.js';

type LoaderVariant = 'brand' | 'neutral' | 'white' | 'danger';
type LoaderSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: LoaderVariant;
  size?: LoaderSize;
  label?: string;
  fullWidth?: boolean;
  center?: boolean;
}

const variantClasses: Record<LoaderVariant, string> = {
  brand: 'text-(--color-brand-600)',
  neutral: 'text-(--ui-text)',
  white: 'text-white',
  danger: 'text-(--color-danger-600)',
};

const sizeClasses: Record<LoaderSize, string> = {
  xs: 'size-3',
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-7',
  xl: 'size-10',
};

const Spinner: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={cn('animate-spin', className)}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);

export const Loader = React.forwardRef<HTMLDivElement, LoaderProps>(
  (
    {
      variant = 'brand',
      size = 'md',
      label,
      fullWidth = false,
      center = false,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        role="status"
        className={cn(
          'inline-flex items-center gap-2',
          variantClasses[variant],
          fullWidth && 'w-full',
          center && 'justify-center',
          className,
        )}
        {...props}
      >
        <Spinner className={sizeClasses[size]} />

        {label && (
          <span className="text-sm text-(--ui-text-muted)">
            {label}
          </span>
        )}

        <span className="sr-only">Loading...</span>
      </div>
    );
  },
);

Loader.displayName = 'Loader';