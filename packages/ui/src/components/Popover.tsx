import React from 'react';
import {
  Popover as HeadlessPopover,
  PopoverButton,
  PopoverPanel,
} from '@headlessui/react';
import { cn } from '../lib/cn.js';

export type PopoverAnchor =
  | 'bottom'
  | 'bottom start'
  | 'bottom end'
  | 'top'
  | 'top start'
  | 'top end'
  | 'left'
  | 'right';

export interface PopoverProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  anchor?: PopoverAnchor;
  className?: string;
  panelClassName?: string;
}

export const Popover: React.FC<PopoverProps> = ({
  trigger,
  children,
  anchor = 'bottom',
  className,
  panelClassName,
}) => {
  return (
    <HeadlessPopover className={cn('relative inline-block', className)}>
      <PopoverButton as={React.Fragment}>{trigger}</PopoverButton>

      <PopoverPanel
        transition
        anchor={anchor}
        className={cn(
          'z-50 mt-2 rounded-(--radius-xl)',
          'bg-(--ui-bg) border border-(--ui-border)',
          'shadow-xl shadow-black/10',
          'p-4',
          'transition-all duration-150 ease-out',
          'data-[closed]:opacity-0 data-[closed]:translate-y-1',
          'focus:outline-none',
          panelClassName,
        )}
      >
        {children}
      </PopoverPanel>
    </HeadlessPopover>
  );
};
