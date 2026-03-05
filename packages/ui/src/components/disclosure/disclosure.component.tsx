import React from 'react';
import {
  Disclosure as HeadlessUIDisclosure,
  DisclosureButton as HeadlessUIDisclosureButton,
  DisclosurePanel as HeadlessUIDisclosurePanel,
} from '@headlessui/react';
import { cn } from '@inithium/theme';
import type {
  IDisclosureButtonProps,
  IDisclosurePanelProps,
  IDisclosureProps,
} from './disclosure.types.js';

export function Disclosure(props: IDisclosureProps): React.JSX.Element {
  const { children, className, defaultOpen } = props;

  return (
    <HeadlessUIDisclosure defaultOpen={defaultOpen}>
      <div className={cn('w-full', className)}>{children}</div>
    </HeadlessUIDisclosure>
  );
}

export function DisclosureButton(props: IDisclosureButtonProps): React.JSX.Element {
  const { children, className, onClick } = props;

  return (
    <HeadlessUIDisclosureButton
      className={cn('disclosure-button', className)}
      onClick={onClick}
    >
      {children}
    </HeadlessUIDisclosureButton>
  );
}

export function DisclosurePanel(props: IDisclosurePanelProps): React.JSX.Element {
  const { children, className } = props;

  return (
    <HeadlessUIDisclosurePanel
      className={cn(
        'disclosure-panel transition-opacity duration-150 data-[closed]:opacity-0 data-[open]:opacity-100',
        className,
      )}
    >
      {children}
    </HeadlessUIDisclosurePanel>
  );
}

