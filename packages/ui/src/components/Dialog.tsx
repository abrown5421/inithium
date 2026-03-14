import React from 'react';
import {
  Dialog as HeadlessDialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  Description,
} from '@headlessui/react';
import { cn } from '../lib/cn.js';

type DialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface DialogProps {
  open: boolean;
  onClose: (value: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: DialogSize;
  className?: string;
}

const sizeClasses: Record<DialogSize, string> = {
  sm:   'max-w-sm',
  md:   'max-w-md',
  lg:   'max-w-lg',
  xl:   'max-w-2xl',
  full: 'max-w-[calc(100vw-2rem)]',
};

export const Dialog: React.FC<DialogProps> = ({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  className,
}) => {
  return (
    <HeadlessDialog
      open={open}
      onClose={onClose}
      className="relative z-50"
    >
      {/* Backdrop */}
      <DialogBackdrop
        transition
        className={cn(
          'fixed inset-0 bg-black/40 backdrop-blur-sm',
          'transition-opacity duration-200 ease-out',
          'data-[closed]:opacity-0',
        )}
      />

      {/* Centering wrapper */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel
          transition
          className={cn(
            'w-full rounded-(--radius-xl) bg-(--ui-bg)',
            'border border-(--ui-border)',
            'shadow-xl',
            'transition-all duration-200 ease-out',
            'data-[closed]:opacity-0 data-[closed]:scale-95',
            sizeClasses[size],
            className,
          )}
        >
          {(title || description) && (
            <div className="px-6 pt-6 pb-4 border-b border-(--ui-border)">
              {title && (
                <DialogTitle className="text-base font-semibold text-(--ui-text) leading-snug">
                  {title}
                </DialogTitle>
              )}
              {description && (
                <Description className="mt-1 text-sm text-(--ui-text-muted)">
                  {description}
                </Description>
              )}
            </div>
          )}

          {children && <div className="px-6 py-4">{children}</div>}

          {footer && (
            <div className="px-6 pb-6 pt-2 flex justify-end gap-2">
              {footer}
            </div>
          )}
        </DialogPanel>
      </div>
    </HeadlessDialog>
  );
};
