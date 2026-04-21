  import type { ThemeColor, ComponentSize } from '@inithium/types';

  export type InputVariant = 'filled' | 'outlined' | 'ghost';

  export type InputType =
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'tel'
    | 'url'
    | 'search'
    | 'date'
    | 'time'
    | 'datetime-local';

  export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'color'> {
    variant?: InputVariant;
    size?: ComponentSize;
    color?: ThemeColor;
    label?: React.ReactNode;
    description?: React.ReactNode;
    error?: React.ReactNode;
    leadingIcon?: React.ReactNode;
    trailingIcon?: React.ReactNode;
    className?: string;
    inputClassName?: string;
    labelClassName?: string;
    descriptionClassName?: string;
    errorClassName?: string;
    wrapperClassName?: string;
    type?: InputType;
    invalid?: boolean;
  }