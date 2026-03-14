import React, { useId } from 'react';
import { cn } from '../lib/cn.js';

type TooltipSide = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  side?: TooltipSide;
  className?: string;
}

const sideClasses: Record<TooltipSide, string> = {
  top:    'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left:   'right-full top-1/2 -translate-y-1/2 mr-2',
  right:  'left-full top-1/2 -translate-y-1/2 ml-2',
};

const arrowClasses: Record<TooltipSide, string> = {
  top:    'top-full left-1/2 -translate-x-1/2 border-t-(--color-surface-800) border-t-4 border-x-4 border-x-transparent border-b-0',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-(--color-surface-800) border-b-4 border-x-4 border-x-transparent border-t-0',
  left:   'left-full top-1/2 -translate-y-1/2 border-l-(--color-surface-800) border-l-4 border-y-4 border-y-transparent border-r-0',
  right:  'right-full top-1/2 -translate-y-1/2 border-r-(--color-surface-800) border-r-4 border-y-4 border-y-transparent border-l-0',
};

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  side = 'top',
  className,
}) => {
  const id = useId();

  return (
    <span className="relative inline-flex group" aria-describedby={id}>
      {children}
      <span
        id={id}
        role="tooltip"
        className={cn(
          'pointer-events-none absolute z-50 whitespace-nowrap',
          'rounded-(--radius-md) px-2.5 py-1.5',
          'text-xs font-medium text-white',
          'bg-(--color-surface-800) dark:bg-(--color-surface-700)',
          'shadow-md',
          'opacity-0 scale-95',
          'transition-all duration-150 ease-out',
          'group-hover:opacity-100 group-hover:scale-100',
          'group-focus-within:opacity-100 group-focus-within:scale-100',
          sideClasses[side],
          className,
        )}
      >
        {content}
        <span className={cn('absolute border', arrowClasses[side])} />
      </span>
    </span>
  );
};
