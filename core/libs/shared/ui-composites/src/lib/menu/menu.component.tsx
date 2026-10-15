import type { ReactElement } from 'react';
import * as RadixMenu from '@radix-ui/react-dropdown-menu';
import { Icon, type IconName } from '@inithium/shared-ui-components';
import { menuStyleSheet } from './menu.styles';

/** One row of a Menu: an action with its label, and optionally an icon, a shortcut hint and a danger colour. */
export type MenuAction = {
  label: string;
  onSelect: () => void;
  icon?: IconName;
  /** A hint at the row's end, e.g. 'Ctrl+D'. It only describes the shortcut; the caller handles the keys. */
  shortcut?: string;
  disabled?: boolean;
  /** Draws the row in red, for actions that remove something. */
  danger?: boolean;
};

/** A row of a Menu, or a thin line between groups of rows. */
export type MenuItem = MenuAction | 'separator';

export type MenuProps = {
  /** The rows, top to bottom. */
  items: MenuItem[];
  /** The button that opens it. It must take a ref and events, e.g. a Button. */
  children: ReactElement;
  /** Which side of the button it opens on. Default 'bottom'. */
  side?: 'top' | 'right' | 'bottom' | 'left';
  /** How it lines up with the button. Default 'start'. */
  align?: 'start' | 'center' | 'end';
  /** Names the menu for screen readers, e.g. 'Actions for Card'. */
  'aria-label'?: string;
  /** Whether it's open, to control it; leave it out and it opens and closes itself. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

/**
 * A list of actions that opens from a button (decision 0056): Radix's accessible dropdown menu, opened by click,
 * Enter, Space or the arrow keys, moved through with the arrow keys and letters, closed with Escape. It renders in a
 * portal at the end of the page, at the popup layer (z-index 50), so nothing clips it.
 */
export function Menu({ items, children, side = 'bottom', align = 'start', 'aria-label': ariaLabel, open, onOpenChange }: MenuProps) {
  return (
    <RadixMenu.Root open={open} onOpenChange={onOpenChange} modal={false}>
      <RadixMenu.Trigger asChild>{children}</RadixMenu.Trigger>
      <RadixMenu.Portal>
        <RadixMenu.Content className="ui-menu" side={side} align={align} sideOffset={4} collisionPadding={8} aria-label={ariaLabel}>
          {/* React hoists this to <head> and keeps one copy however many Menus render. */}
          <style href="inithium-menu" precedence="default">
            {menuStyleSheet}
          </style>
          {items.map((item, index) =>
            item === 'separator' ? (
              <RadixMenu.Separator key={`separator-${index}`} className="ui-menu-separator" />
            ) : (
              <RadixMenu.Item
                key={item.label}
                className="ui-menu-item"
                disabled={item.disabled}
                data-danger={item.danger ? '' : undefined}
                onSelect={item.onSelect}
              >
                {item.icon && <Icon name={item.icon} size={16} />}
                {/* Plain spans: the menu's own internals, styled by its stylesheet (decision 0092). */}
                <span className="ui-menu-label">{item.label}</span>
                {item.shortcut && (
                  <span className="ui-menu-shortcut" aria-hidden="true">
                    {item.shortcut}
                  </span>
                )}
              </RadixMenu.Item>
            ),
          )}
        </RadixMenu.Content>
      </RadixMenu.Portal>
    </RadixMenu.Root>
  );
}
