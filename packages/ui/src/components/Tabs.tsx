import React from 'react';
import {
  TabGroup,
  TabList,
  Tab as HeadlessTab,
  TabPanels,
  TabPanel,
} from '@headlessui/react';
import { cn } from '../lib/cn.js';

export interface TabItem {
  id: string;
  label: React.ReactNode;
  content: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

type TabsVariant = 'underline' | 'pills' | 'boxed';

export interface TabsProps {
  items: TabItem[];
  variant?: TabsVariant;
  defaultIndex?: number;
  onChange?: (index: number) => void;
  className?: string;
}

const listVariant: Record<TabsVariant, string> = {
  underline: 'flex gap-1 border-b border-(--ui-border)',
  pills:     'flex gap-1 p-1 rounded-(--radius-lg) bg-(--ui-bg-subtle)',
  boxed:     'flex gap-0 border border-(--ui-border) rounded-(--radius-lg) overflow-hidden p-0',
};

const tabVariant: Record<TabsVariant, string> = {
  underline: cn(
    'px-4 py-2 -mb-px text-sm font-medium border-b-2 border-transparent',
    'text-(--ui-text-muted) hover:text-(--ui-text) hover:border-(--ui-border)',
    'transition-colors duration-150 focus-visible:outline-none',
    'data-[selected]:border-(--color-brand-500) data-[selected]:text-(--color-brand-600)',
    'data-[disabled]:opacity-40 data-[disabled]:cursor-not-allowed',
  ),
  pills: cn(
    'px-3 py-1.5 text-sm font-medium rounded-(--radius-md)',
    'text-(--ui-text-muted) hover:text-(--ui-text)',
    'transition-all duration-150 focus-visible:outline-none',
    'data-[selected]:bg-(--ui-bg) data-[selected]:text-(--ui-text) data-[selected]:shadow-sm',
    'data-[disabled]:opacity-40 data-[disabled]:cursor-not-allowed',
  ),
  boxed: cn(
    'px-4 py-2 text-sm font-medium border-r border-(--ui-border) last:border-r-0',
    'text-(--ui-text-muted) hover:bg-(--ui-bg-subtle) hover:text-(--ui-text)',
    'transition-colors duration-150 focus-visible:outline-none',
    'data-[selected]:bg-(--color-brand-600) data-[selected]:text-white',
    'data-[disabled]:opacity-40 data-[disabled]:cursor-not-allowed',
  ),
};

export const Tabs: React.FC<TabsProps> = ({
  items,
  variant = 'underline',
  defaultIndex = 0,
  onChange,
  className,
}) => {
  return (
    <TabGroup
      defaultIndex={defaultIndex}
      onChange={onChange}
      className={cn('w-full', className)}
    >
      <TabList className={listVariant[variant]}>
        {items.map((item) => (
          <HeadlessTab
            key={item.id}
            disabled={item.disabled}
            className={cn('inline-flex items-center gap-1.5 whitespace-nowrap', tabVariant[variant])}
          >
            {item.icon && <span className="size-4 shrink-0">{item.icon}</span>}
            {item.label}
          </HeadlessTab>
        ))}
      </TabList>
      <TabPanels className="mt-4">
        {items.map((item) => (
          <TabPanel
            key={item.id}
            className={cn(
              'text-sm text-(--ui-text)',
              'focus-visible:outline-none',
              'transition-opacity duration-150',
            )}
          >
            {item.content}
          </TabPanel>
        ))}
      </TabPanels>
    </TabGroup>
  );
};
