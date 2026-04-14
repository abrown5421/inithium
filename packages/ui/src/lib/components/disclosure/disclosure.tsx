import React from 'react';
import {
  Disclosure as HeadlessDisclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react';
import { cn, INTERACTIVE_COLOR_MAP, COMPONENT_SIZE_MAP } from '@inithium/utils';
import type { ThemeColor, ComponentSize } from '@inithium/types';
import type { DisclosureVariant, DisclosureProps } from './disclosure.types';

const getVariantStyles = (variant: DisclosureVariant, color: ThemeColor): string => {
  const c = INTERACTIVE_COLOR_MAP[color];

  const styles: Record<DisclosureVariant, string> = {
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

export const Disclosure: React.FC<DisclosureProps> = ({
  trigger,
  children,
  variant = 'outlined',
  size = 'base',
  color = 'primary',
  className = '',
  triggerClassName = '',
  panelClassName = '',
  defaultOpen = false,
}) => {
  const triggerClasses = cn(
    'w-full border-2 rounded-md transition duration-200 ease-in-out focus:outline-none data-[open]:rounded-b-none hover:cursor-pointer flex items-center justify-between',
    getVariantStyles(variant, color),
    COMPONENT_SIZE_MAP[size as ComponentSize],
    triggerClassName,
  );

  return (
    <HeadlessDisclosure defaultOpen={defaultOpen} as="div" className={cn('w-full', className)}>
      <DisclosureButton className={triggerClasses}>
        {trigger}
      </DisclosureButton>
      <DisclosurePanel
        className={cn(
          'rounded-b-md border-2 border-t-0 bg-surface p-4 transition duration-200 ease-out data-[closed]:-translate-y-1 data-[closed]:opacity-0',
          INTERACTIVE_COLOR_MAP[color].border,
          panelClassName,
        )}
      >
        {children}
      </DisclosurePanel>
    </HeadlessDisclosure>
  );
};