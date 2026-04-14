import type { ThemeColor, ComponentSize } from '@inithium/types';

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: React.ReactNode;
  color?: ThemeColor;
  size?: ComponentSize;
  disabled?: boolean;
  className?: string;
  checkboxClassName?: string;
  labelClassName?: string;
  descriptionClassName?: string;
  name?: string;
  value?: string;
}