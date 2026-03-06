import React from 'react';
import {
  Menu as HeadlessUIMenu,
  MenuButton as HeadlessUIMenuButton,
  MenuItems as HeadlessUIMenuItems,
  MenuItem as HeadlessUIMenuItem,
} from '@headlessui/react';
import { cn } from '@inithium/theme';
import type {
  IMenuButtonProps,
  IMenuItemProps,
  IMenuItemsProps,
  IMenuProps,
} from './menu.types.js';

export function Menu(props: IMenuProps): React.JSX.Element {
  const { children, className } = props;

  return (
    <HeadlessUIMenu as="div" className={cn('relative inline-block text-left', className)}>
      {children}
    </HeadlessUIMenu>
  );
}

export function MenuButton(props: IMenuButtonProps): React.JSX.Element {
  const { children, className } = props;

  return (
    <HeadlessUIMenuButton className={cn('btn btn-md btn-ghost', className)}>
      {children}
    </HeadlessUIMenuButton>
  );
}

export function MenuItems(props: IMenuItemsProps): React.JSX.Element {
  const { children, className } = props;

  return (
    <HeadlessUIMenuItems
      anchor="bottom start"
      className={cn(
        'absolute left-0 top-full mt-2 z-50',
        'popover-panel',
        className
      )}
    >
      {children}
    </HeadlessUIMenuItems>
  );
}

export function MenuItem(props: IMenuItemProps): React.JSX.Element {
  const { children, className, disabled, onClick } = props;

  return (
    <HeadlessUIMenuItem disabled={disabled}>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'block w-full cursor-default px-3 py-2 text-left text-sm text-foreground transition-colors',
          'data-[focus]:bg-muted',
          'data-[disabled]:opacity-50 data-[disabled]:pointer-events-none',
          className,
        )}
      >
        {children}
      </button>
    </HeadlessUIMenuItem>
  );
}

