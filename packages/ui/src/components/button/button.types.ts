import type { BaseComponentProps, Size, Variant } from '../../types/component.types.js';

export interface IButtonProps extends BaseComponentProps {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

