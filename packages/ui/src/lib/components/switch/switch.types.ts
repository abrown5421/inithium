import type { ThemeColor, ComponentSize } from '@inithium/types';

export type SwitchColor = Exclude<ThemeColor, `${string}-contrast`>;

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: React.ReactNode;
  color?: SwitchColor;
  size?: ComponentSize;
  disabled?: boolean;
  className?: string;
  switchClassName?: string;
  labelClassName?: string;
  descriptionClassName?: string;
  name?: string;
  value?: string;
  labelPosition?: 'left' | 'right';
}