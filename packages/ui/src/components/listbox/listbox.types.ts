import type { BaseComponentProps, Size } from '../../types/component.types.js';
import type { FieldBaseProps } from '../../types/field.types.js';

export interface IListboxOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface IListboxProps<T = string>
  extends BaseComponentProps,
    FieldBaseProps {
  value?: T;
  onChange?: (value: T) => void;
  options: IListboxOption<T>[];
  placeholder?: string;
  disabled?: boolean;
  size?: Size;
}

