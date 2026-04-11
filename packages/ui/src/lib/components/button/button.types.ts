import { ButtonProps as HeadlessButtonProps } from '@headlessui/react';

export type ButtonVariant = 'outlined' | 'filled' | 'ghost';
export type ButtonSize = 'sm' | 'base' | 'lg' | 'xl';
export type ThemeColor = 
  | 'primary' 
  | 'secondary' 
  | 'accent' 
  | 'success' 
  | 'warning' 
  | 'danger' 
  | 'info' 
  | 'surface2';

export interface BaseButtonProps extends HeadlessButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  color?: ThemeColor; // Strictly typed to our theme keys
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void | unknown;
  children?: React.ReactNode;
}