import type { ThemeColor, ComponentSize } from '@inithium/types';

export type TabsVariant = 'filled' | 'outlined' | 'ghost';

export interface TabItem {
  label: React.ReactNode;
  panel: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  variant?: TabsVariant;
  size?: ComponentSize;
  color?: ThemeColor;
  className?: string;
  listClassName?: string;
  tabClassName?: string;
  activeTabClassName?: string;
  panelClassName?: string;
  defaultIndex?: number;
  onChange?: (index: number) => void;
  vertical?: boolean;
}