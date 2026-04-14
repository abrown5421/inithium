import type { ThemeColor, ComponentSize } from '@inithium/types';

export type TextareaVariant = 'filled' | 'outlined' | 'ghost';
export type TextareaResize = 'none' | 'vertical' | 'horizontal' | 'both';

export interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'color'> {
  variant?: TextareaVariant;
  size?: ComponentSize;
  color?: ThemeColor;
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  resize?: TextareaResize;
  showCharCount?: boolean;
  maxLength?: number;
  className?: string;
  textareaClassName?: string;
  labelClassName?: string;
  descriptionClassName?: string;
  errorClassName?: string;
  wrapperClassName?: string;
  invalid?: boolean;
  rows?: number;
}