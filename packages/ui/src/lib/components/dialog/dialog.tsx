import React from 'react';
import {
  Dialog as HeadlessDialog,
  DialogPanel,
  DialogTitle,
  Description,
} from '@headlessui/react';
import { cn, INTERACTIVE_COLOR_MAP } from '@inithium/utils';
import type { ThemeColor } from '@inithium/types';
import type { DialogSize, DialogProps } from './dialog.types';

const DIALOG_SIZE_MAP: Record<DialogSize, string> = {
  sm: 'max-w-sm',
  base: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full mx-32',
};

export const Dialog: React.FC<DialogProps> = ({
  open,
  onClose,
  title,
  description,
  children,
  color = 'primary',
  size = 'base',
  className = '',
  panelClassName = '',
  titleClassName = '',
  descriptionClassName = '',
  overlayClassName = '',
}) => {
  const c = INTERACTIVE_COLOR_MAP[color as ThemeColor];

  return (
    <HeadlessDialog open={open} onClose={onClose} className={cn('relative z-50', className)}>
      <div
        className={cn(
          'fixed inset-0 bg-black/40 backdrop-blur-sm transition duration-200 ease-out data-[closed]:opacity-0',
          overlayClassName,
        )}
        aria-hidden="true"
      />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel
          className={cn(
            'w-full rounded-xl bg-surface p-6 shadow-xl ring-1 ring-black/5 transition duration-200 ease-out data-[closed]:scale-95 data-[closed]:opacity-0',
            DIALOG_SIZE_MAP[size],
            panelClassName,
          )}
        >
          {title && (
            <DialogTitle
              className={cn('text-lg font-semibold mb-1', c.text, titleClassName)}
            >
              {title}
            </DialogTitle>
          )}
          {description && (
            <Description
              className={cn('text-sm text-on-surface/70 mb-4', descriptionClassName)}
            >
              {description}
            </Description>
          )}
          {children}
        </DialogPanel>
      </div>
    </HeadlessDialog>
  );
};