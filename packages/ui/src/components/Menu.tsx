import React from 'react';
import {
  Menu as HeadlessMenu,
  MenuButton,
  MenuItems,
  MenuItem,
} from '@headlessui/react';
import { cn } from '../lib/cn.js';

export interface MenuItemDef {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  shortcut?: string;
  disabled?: boolean;
  danger?: boolean;
  onClick?: () => void;
  href?: string;
}

export interface MenuSection {
  id: string;
  label?: string;
  items: MenuItemDef[];
}

export type MenuAnchor = 'bottom start' | 'bottom end' | 'top start' | 'top end';

export interface MenuProps {
  trigger: React.ReactNode;
  sections: MenuSection[];
  anchor?: MenuAnchor;
  className?: string;
}

export const Menu: React.FC<MenuProps> = ({
  trigger,
  sections,
  anchor = 'bottom start',
  className,
}) => {
  return (
    <HeadlessMenu as="div" className={cn('relative inline-block', className)}>
      <MenuButton as={React.Fragment}>{trigger}</MenuButton>

      <MenuItems
        transition
        anchor={anchor}
        className={cn(
          'z-50 mt-1 min-w-48 rounded-(--radius-lg)',
          'bg-(--ui-bg) border border-(--ui-border)',
          'shadow-lg shadow-black/10',
          'p-1',
          'transition-all duration-150 ease-out',
          'data-[closed]:opacity-0 data-[closed]:scale-95',
          'focus:outline-none',
        )}
      >
        {sections.map((section, sIdx) => (
          <React.Fragment key={section.id}>
            {sIdx > 0 && (
              <div className="my-1 h-px bg-(--ui-border)" role="separator" />
            )}
            {section.label && (
              <p className="px-2 pt-1 pb-0.5 text-xs font-semibold text-(--ui-text-muted) uppercase tracking-wider">
                {section.label}
              </p>
            )}
            {section.items.map((item) => (
              <MenuItem key={item.id} disabled={item.disabled}>
                {item.href ? (
                  <a
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 w-full px-2 py-1.5 rounded-(--radius-md)',
                      'text-sm transition-colors duration-100',
                      item.danger
                        ? 'text-(--color-danger-600) data-[focus]:bg-red-50 dark:data-[focus]:bg-red-950/30'
                        : 'text-(--ui-text) data-[focus]:bg-(--ui-bg-subtle)',
                      item.disabled && 'opacity-40 cursor-not-allowed',
                    )}
                  >
                    {item.icon && (
                      <span className="size-4 shrink-0 text-(--ui-text-muted)">
                        {item.icon}
                      </span>
                    )}
                    <span className="flex-1">{item.label}</span>
                    {item.shortcut && (
                      <kbd className="text-xs text-(--ui-text-muted) font-mono">
                        {item.shortcut}
                      </kbd>
                    )}
                  </a>
                ) : (
                  <button
                    onClick={item.onClick}
                    disabled={item.disabled}
                    className={cn(
                      'flex items-center gap-2 w-full px-2 py-1.5 rounded-(--radius-md)',
                      'text-sm text-left transition-colors duration-100',
                      item.danger
                        ? 'text-(--color-danger-600) data-[focus]:bg-red-50 dark:data-[focus]:bg-red-950/30'
                        : 'text-(--ui-text) data-[focus]:bg-(--ui-bg-subtle)',
                      item.disabled && 'opacity-40 cursor-not-allowed',
                    )}
                  >
                    {item.icon && (
                      <span className="size-4 shrink-0 text-(--ui-text-muted)">
                        {item.icon}
                      </span>
                    )}
                    <span className="flex-1">{item.label}</span>
                    {item.shortcut && (
                      <kbd className="text-xs text-(--ui-text-muted) font-mono">
                        {item.shortcut}
                      </kbd>
                    )}
                  </button>
                )}
              </MenuItem>
            ))}
          </React.Fragment>
        ))}
      </MenuItems>
    </HeadlessMenu>
  );
};
