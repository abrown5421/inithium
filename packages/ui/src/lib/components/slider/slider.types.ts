import type { ThemeColor, ComponentSize } from '@inithium/types';

export type SliderVariant = 'filled' | 'outlined' | 'ghost';

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'color' | 'type' | 'value' | 'defaultValue' | 'onChange'> {
  variant?: SliderVariant;
  size?: ComponentSize;
  color?: ThemeColor;
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  className?: string;
  sliderClassName?: string;
  trackClassName?: string;
  labelClassName?: string;
  descriptionClassName?: string;
  errorClassName?: string;
  wrapperClassName?: string;
  invalid?: boolean;
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  showValue?: boolean;
  formatValue?: (value: number) => string;
}