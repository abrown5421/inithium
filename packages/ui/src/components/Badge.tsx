import React from 'react';
import { cn } from '../lib/cn.js';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  children?: React.ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-(--color-surface-100) text-(--color-surface-700) dark:bg-(--color-surface-800) dark:text-(--color-surface-200)',
  success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  danger:  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  info:    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  outline: 'bg-transparent border border-(--ui-border) text-(--ui-text)',
};

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-(--color-surface-500)',
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  danger:  'bg-red-500',
  info:    'bg-blue-500',
  outline: 'bg-(--color-surface-400)',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'text-[10px] px-1.5 py-0.5 gap-1',
  md: 'text-xs px-2 py-1 gap-1.5',
  lg: 'text-sm px-2.5 py-1 gap-1.5',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  dot = false,
  removable = false,
  onRemove,
  children,
  className,
  ...props
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {dot && (
        <span className={cn('size-1.5 rounded-full shrink-0', dotColors[variant])} />
      )}
      {children}
      {removable && (
        <button
          type="button"
          onClick={onRemove}
          className={cn(
            'ml-0.5 -mr-0.5 rounded-full p-0.5',
            'hover:bg-black/10 dark:hover:bg-white/20',
            'transition-colors duration-100',
            'focus-visible:outline-none focus-visible:ring-1',
          )}
          aria-label="Remove"
        >
          <svg className="size-2.5" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </span>
  );
};
