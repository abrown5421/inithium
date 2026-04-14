import type { ThemeColor, ComponentSize } from '@inithium/types';

export type DropdownVariant = 'filled' | 'outlined' | 'ghost';

export interface DropdownItem {
  label: React.ReactNode;
  value: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface DropdownProps {
  items: DropdownItem[];
  trigger: React.ReactNode;
  variant?: DropdownVariant;
  size?: ComponentSize;
  color?: ThemeColor;
  className?: string;
  triggerClassName?: string;
  panelClassName?: string;
  itemClassName?: string;
  activeItemClassName?: string;
  anchor?: 'bottom' | 'bottom start' | 'bottom end' | 'top' | 'top start' | 'top end';
  onSelect?: (value: string) => void;
  disabled?: boolean;
}