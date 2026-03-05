import type { BaseComponentProps } from '../../types/component.types.js';
import type { FieldBaseProps } from '../../types/field.types.js';

export interface ICheckboxProps extends BaseComponentProps, FieldBaseProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  indeterminate?: boolean;
  name?: string;
  value?: string;
}

