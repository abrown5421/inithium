import { ButtonProps as HeadlessButtonProps } from '@headlessui/react';
import type { ThemeColor } from '@inithium/types'; //error here

export type ButtonVariant = 'outlined' | 'filled' | 'ghost';
export type ButtonSize = 'sm' | 'base' | 'lg' | 'xl';

export interface BaseButtonProps extends HeadlessButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  color?: ThemeColor;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void | unknown;
  children?: React.ReactNode;
}