import type {
  BaseComponentProps,
  InputVariant,
  Size,
} from '../../types/component.types.js';
import type { FieldBaseProps } from '../../types/field.types.js';

export interface IInputProps extends BaseComponentProps, FieldBaseProps {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  variant?: InputVariant;
  size?: Size;
  name?: string;
}

