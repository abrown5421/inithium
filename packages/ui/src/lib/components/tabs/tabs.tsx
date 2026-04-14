import React from 'react';
import {
  TabGroup,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from '@headlessui/react';
import { cn, INTERACTIVE_COLOR_MAP, COMPONENT_SIZE_MAP } from '@inithium/utils';
import type { ThemeColor, ComponentSize } from '@inithium/types';
import type { TabsVariant, TabsProps } from './tabs.types';

const getVariantStyles = (variant: TabsVariant, color: ThemeColor): string => {
  const c = INTERACTIVE_COLOR_MAP[color];

  const styles: Record<TabsVariant, string> = {
    filled: cn(
      'rounded-md border-2 transition duration-200',
      c.border,
      'data-[selected]:' + c.bg.replace('bg-', 'bg-'),
      'data-[selected]:' + c.textContrast.replace('text-', 'text-'),
      'data-[selected]:border-transparent',
      c.text,
      c.hoverBg,
      c.hoverTextContrast,
    ),
    outlined: cn(
      'rounded-md border-2 transition duration-200',
      c.border,
      'data-[selected]:' + c.bgContrast.replace('bg-', 'bg-'),
      'data-[selected]:border-transparent',
      c.text,
    ),
    ghost: cn(
      'border-b-2 border-transparent transition duration-200',
      c.text,
      'data-[selected]:border-b-2',
      'data-[selected]:' + c.hoverBorderB.replace('hover:', ''),
    ),
  };

  return styles[variant];
};

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  variant = 'ghost',
  size = 'base',
  color = 'primary',
  className = '',
  listClassName = '',
  tabClassName = '',
  activeTabClassName = '',
  panelClassName = '',
  defaultIndex = 0,
  onChange,
  vertical = false,
}) => {
  const c = INTERACTIVE_COLOR_MAP[color as ThemeColor];

  return (
    <TabGroup
      defaultIndex={defaultIndex}
      onChange={onChange}
      vertical={vertical}
      className={cn('w-full', vertical && 'flex gap-4', className)}
    >
      <TabList
        className={cn(
          'flex gap-1',
          vertical ? 'flex-col' : 'flex-row',
          variant !== 'ghost' && 'bg-surface2 p-1 rounded-lg',
          listClassName,
        )}
      >
        {tabs.map((tab, i) => (
          <Tab
            key={i}
            disabled={tab.disabled}
            className={cn(
              'focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed',
              COMPONENT_SIZE_MAP[size as ComponentSize],
              getVariantStyles(variant, color as ThemeColor),
              tabClassName,
              'data-[selected]:' + activeTabClassName,
            )}
          >
            {tab.label}
          </Tab>
        ))}
      </TabList>
      <TabPanels className={cn('mt-4', vertical && 'mt-0 flex-1')}>
        {tabs.map((tab, i) => (
          <TabPanel
            key={i}
            className={cn(
              'focus:outline-none transition duration-200 data-[closed]:opacity-0',
              panelClassName,
            )}
          >
            {tab.panel}
          </TabPanel>
        ))}
      </TabPanels>
    </TabGroup>
  );
};