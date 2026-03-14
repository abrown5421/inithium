import React from 'react';
import { cn } from '../lib/cn.js';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
  hover?: boolean;
  children?: React.ReactNode;
}

const paddingClasses = {
  none: '',
  sm:   'p-3',
  md:   'p-5',
  lg:   'p-7',
};

const shadowClasses = {
  none: '',
  sm:   'shadow-sm',
  md:   'shadow-md',
  lg:   'shadow-lg',
};

export const Card: React.FC<CardProps> = ({
  padding = 'md',
  shadow = 'sm',
  border = true,
  hover = false,
  children,
  className,
  ...props
}) => (
  <div
    className={cn(
      'rounded-(--radius-xl) bg-(--ui-bg)',
      border && 'border border-(--ui-border)',
      hover && 'transition-shadow duration-200 hover:shadow-md hover:border-(--color-brand-200) dark:hover:border-(--color-brand-800) cursor-pointer',
      paddingClasses[padding],
      shadowClasses[shadow],
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  description,
  action,
  className,
  children,
  ...props
}) => (
  <div
    className={cn('flex items-start justify-between gap-4 mb-4', className)}
    {...props}
  >
    <div className="flex flex-col gap-0.5 flex-1">
      {title && <h3 className="font-semibold text-(--ui-text) text-base leading-tight">{title}</h3>}
      {description && <p className="text-sm text-(--ui-text-muted)">{description}</p>}
      {children}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

export const CardBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={cn('text-sm text-(--ui-text)', className)} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div
    className={cn('flex items-center gap-2 mt-5 pt-4 border-t border-(--ui-border)', className)}
    {...props}
  >
    {children}
  </div>
);
