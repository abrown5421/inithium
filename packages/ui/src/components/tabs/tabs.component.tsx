import React from 'react';
import {
  Tab as HeadlessUITab,
  TabGroup as HeadlessUITabGroup,
  TabList as HeadlessUITabList,
  TabPanel as HeadlessUITabPanel,
} from '@headlessui/react';
import { cn } from '@inithium/theme';
import type {
  ITabListProps,
  ITabPanelProps,
  ITabProps,
  ITabsProps,
} from './tabs.types.js';

export function TabGroup(props: ITabsProps): React.JSX.Element {
  const { children, className, defaultIndex, onChange } = props;

  return (
    <HeadlessUITabGroup
      defaultIndex={defaultIndex}
      onChange={onChange}
      as="div"
      className={cn(className)}
    >
      {children}
    </HeadlessUITabGroup>
  );
}

export function TabList(props: ITabListProps): React.JSX.Element {
  const { children, className } = props;

  return (
    <HeadlessUITabList className={cn('tab-list', className)}>{children}</HeadlessUITabList>
  );
}

export function Tab(props: ITabProps): React.JSX.Element {
  const { children, className, disabled } = props;

  return (
    <HeadlessUITab className={cn('tab-item', className)} disabled={disabled}>
      {children}
    </HeadlessUITab>
  );
}

export function TabPanel(props: ITabPanelProps): React.JSX.Element {
  const { children, className } = props;

  return (
    <HeadlessUITabPanel className={cn('tab-panel', className)}>{children}</HeadlessUITabPanel>
  );
}

// Convenience alias
export const Tabs = TabGroup;

