import type { BaseComponentProps } from '../../types/component.types.js';
import type { FieldBaseProps } from '../../types/field.types.js';

export interface ISwitchProps extends BaseComponentProps, FieldBaseProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

