import React from 'react';
import {
  Menu,
  MenuButton,
  MenuItems,
  MenuItem,
} from '@headlessui/react';
import { cn, INTERACTIVE_COLOR_MAP, COMPONENT_SIZE_MAP } from '@inithium/utils';
import type { ThemeColor, ComponentSize } from '@inithium/types';
import type { DropdownVariant, DropdownProps } from './dropdown.types';

const getVariantStyles = (variant: DropdownVariant, color: ThemeColor): string => {
  const c = INTERACTIVE_COLOR_MAP[color];

  const styles: Record<DropdownVariant, string> = {
    filled: cn(c.bg, c.border, c.textContrast, c.hoverBgContrast, c.hoverText),
    outlined: cn(c.bgContrast, c.border, c.text, c.hoverBg, c.hoverTextContrast),
    ghost: cn(
      'border-2 border-transparent',
      c.text,
      c.hoverText,
      c.hoverBorderB,
      'hover:border-t-transparent hover:border-r-transparent hover:border-l-transparent',
      'hover:shadow-glow',
    ),
  };

  return styles[variant];
};

export const Dropdown: React.FC<DropdownProps> = ({
  items,
  trigger,
  variant = 'filled',
  size = 'base',
  color = 'primary',
  className = '',
  triggerClassName = '',
  panelClassName = '',
  itemClassName = '',
  activeItemClassName = '',
  anchor = 'bottom',
  onSelect,
  disabled = false,
}) => {
  const triggerClasses = cn(
    'border-2 rounded-md transition duration-200 ease-in-out focus:outline-none data-[active]:scale-[0.98] hover:cursor-pointer inline-flex items-center gap-2',
    getVariantStyles(variant, color),
    COMPONENT_SIZE_MAP[size as ComponentSize],
    triggerClassName,
    className,
  );
  
  const basePanelStyles = 'z-10 rounded-xl bg-surface shadow-lg ring-1 ring-black/5 transition duration-200 ease-out data-[closed]:scale-95 data-[closed]:opacity-0 focus:outline-none';

  const panelClasses = cn(
    basePanelStyles,
    panelClassName
  );

  return (
    <Menu>
      <MenuButton disabled={disabled} className={triggerClasses}>
        {trigger}
      </MenuButton>
      <MenuItems anchor={anchor} className={panelClasses}>
        {items.map((item) => (
          <MenuItem key={item.value} disabled={item.disabled}>
            {({ focus, disabled: isDisabled }) => (
              <button
                className={cn(
                  'flex w-full items-center gap-2 px-4 py-2 text-sm transition duration-100',
                  focus && cn(INTERACTIVE_COLOR_MAP[color].bg, INTERACTIVE_COLOR_MAP[color].textContrast),
                  focus && activeItemClassName,
                  isDisabled && 'opacity-50 cursor-not-allowed',
                  !focus && 'text-on-surface',
                  itemClassName,
                )}
                onClick={() => !isDisabled && onSelect?.(item.value)}
              >
                {item.icon}
                {item.label}
              </button>
            )}
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>
  );
};