import type { ThemeColor, ComponentSize } from '@inithium/types';
import type { InputVariant } from '../../components/input/input.types';

export interface ColorPickerProps {
  value?: string;
  defaultValue?: string;
  onChange?: (hex: string) => void;
  variant?: InputVariant;
  size?: ComponentSize;
  color?: ThemeColor;
  label?: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  descriptionClassName?: string;
}