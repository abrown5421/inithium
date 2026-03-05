import type { BaseComponentProps } from '../../types/component.types.js';
import type { FieldBaseProps } from '../../types/field.types.js';

export interface ITextareaProps extends BaseComponentProps, FieldBaseProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  rows?: number;
  name?: string;
}

