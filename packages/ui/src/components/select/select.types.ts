import type { BaseComponentProps, Size } from '../../types/component.types.js';
import type { FieldBaseProps } from '../../types/field.types.js';

export interface ISelectProps<T = string>
  extends BaseComponentProps,
    FieldBaseProps {
  value?: T;
  onChange?: (value: T) => void;
  disabled?: boolean;
  size?: Size;
  name?: string;
  children?: React.ReactNode;
}

