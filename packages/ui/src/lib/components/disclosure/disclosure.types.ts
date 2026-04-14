import type { ThemeColor, ComponentSize } from '@inithium/types';

export type DisclosureVariant = 'filled' | 'outlined' | 'ghost';

export interface DisclosureProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  variant?: DisclosureVariant;
  size?: ComponentSize;
  color?: ThemeColor;
  className?: string;
  triggerClassName?: string;
  panelClassName?: string;
  defaultOpen?: boolean;
}