import type { ThemeColor, ComponentSize } from '@inithium/types';

export type SelectVariant = 'filled' | 'outlined' | 'ghost';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size' | 'color'> {
  options: SelectOption[];
  variant?: SelectVariant;
  size?: ComponentSize;
  color?: ThemeColor;
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  placeholder?: string;
  className?: string;
  selectClassName?: string;
  labelClassName?: string;
  descriptionClassName?: string;
  errorClassName?: string;
  wrapperClassName?: string;
  invalid?: boolean;
  leadingIcon?: React.ReactNode;
}