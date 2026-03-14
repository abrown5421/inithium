import React from 'react';
import { Button as HeadlessButton } from '@headlessui/react';
import { cn } from '../lib/cn.js';

type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  solid: [
    'bg-(--color-brand-600) text-white',
    'hover:bg-(--color-brand-700)',
    'active:bg-(--color-brand-800)',
    'disabled:bg-(--color-surface-200) disabled:text-(--color-surface-400)',
    'focus-visible:ring-2 focus-visible:ring-(--color-brand-500) focus-visible:ring-offset-2',
    'shadow-xs',
  ].join(' '),
  outline: [
    'border border-(--ui-border) bg-transparent text-(--ui-text)',
    'hover:bg-(--ui-bg-subtle) hover:border-(--color-brand-400)',
    'active:bg-(--color-surface-100)',
    'disabled:opacity-50',
    'focus-visible:ring-2 focus-visible:ring-(--color-brand-500) focus-visible:ring-offset-2',
  ].join(' '),
  ghost: [
    'bg-transparent text-(--ui-text)',
    'hover:bg-(--ui-bg-subtle)',
    'active:bg-(--color-surface-200)',
    'disabled:opacity-50',
    'focus-visible:ring-2 focus-visible:ring-(--color-brand-500) focus-visible:ring-offset-2',
  ].join(' '),
  danger: [
    'bg-(--color-danger-600) text-white',
    'hover:bg-red-700',
    'active:bg-red-800',
    'disabled:opacity-50',
    'focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2',
    'shadow-xs',
  ].join(' '),
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: 'h-7 px-2.5 text-xs gap-1.5 rounded-(--radius-sm)',
  sm: 'h-8 px-3 text-sm gap-1.5 rounded-(--radius-md)',
  md: 'h-9 px-4 text-sm gap-2 rounded-(--radius-md)',
  lg: 'h-10 px-5 text-base gap-2 rounded-(--radius-lg)',
  xl: 'h-12 px-6 text-base gap-2.5 rounded-(--radius-lg)',
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

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'solid',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      className,
      ...props
    },
    ref,
  ) => {
    const iconSize: Record<ButtonSize, string> = {
      xs: 'size-3',
      sm: 'size-3.5',
      md: 'size-4',
      lg: 'size-4',
      xl: 'size-5',
    };

    return (
      <HeadlessButton
        ref={ref}
        disabled={disabled ?? loading}
        className={cn(
          'inline-flex items-center justify-center font-medium',
          'transition-all duration-150 ease-out',
          'cursor-pointer disabled:cursor-not-allowed',
          'select-none whitespace-nowrap',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          className,
        )}
        {...props}
      >
        {loading ? (
          <Spinner className={iconSize[size]} />
        ) : (
          leftIcon && (
            <span className={cn('shrink-0', iconSize[size])}>{leftIcon}</span>
          )
        )}
        {children}
        {!loading && rightIcon && (
          <span className={cn('shrink-0', iconSize[size])}>{rightIcon}</span>
        )}
      </HeadlessButton>
    );
  },
);

Button.displayName = 'Button';
