import React from 'react';
import {
  Dialog as HeadlessUIDialog,
  DialogPanel as HeadlessUIDialogPanel,
  DialogTitle as HeadlessUIDialogTitle,
  DialogDescription as HeadlessUIDialogDescription,
} from '@headlessui/react';
import { cn } from '@inithium/theme';
import type {
  IDialogPanelProps,
  IDialogProps,
  IDialogTitleProps,
} from './dialog.types.js';

export function Dialog(props: IDialogProps): React.JSX.Element {
  const { open, onClose, className, title, description, children } = props;

  return (
    <HeadlessUIDialog open={open} onClose={onClose} className={cn('relative z-50', className)}>
      <div className="fixed inset-0 flex items-center justify-center px-4 py-6">
        <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm transition-opacity data-[closed]:opacity-0 data-[open]:opacity-100" />

        <div className="relative z-10 flex w-full items-center justify-center">
          <HeadlessUIDialogPanel
            className={cn(
              'popover-panel card max-w-lg w-full data-[closed]:opacity-0 data-[closed]:scale-95 data-[open]:opacity-100 data-[open]:scale-100',
              'transition-transform',
            )}
          >
            {(title || description) && (
              <div className="card-header">
                {title ? <DialogTitle>{title}</DialogTitle> : null}
                {description ? (
                  <HeadlessUIDialogDescription className="text-sm text-muted-foreground">
                    {description}
                  </HeadlessUIDialogDescription>
                ) : null}
              </div>
            )}
            <div className="card-body">{children}</div>
          </HeadlessUIDialogPanel>
        </div>
      </div>
    </HeadlessUIDialog>
  );
}

export function DialogPanel(props: IDialogPanelProps): React.JSX.Element {
  const { className, children } = props;

  return (
    <HeadlessUIDialogPanel className={cn('card popover-panel', className)}>
      {children}
    </HeadlessUIDialogPanel>
  );
}

export function DialogTitle(props: IDialogTitleProps): React.JSX.Element {
  const { className, children } = props;

  return (
    <HeadlessUIDialogTitle className={cn('text-lg font-semibold', className)}>
      {children}
    </HeadlessUIDialogTitle>
  );
}

