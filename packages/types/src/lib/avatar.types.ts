import { HTMLAttributes } from "react";
import { ThemeFont } from "./typography.types.js";

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarOptions {
  gradient?: string;
  font?: ThemeFont;
  variant?: 'square' | 'circular';
}

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  initials?: string;
  size?: AvatarSize;
  alt?: string;
  options?: AvatarOptions;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

export const SIZE_MAP: Record<AvatarSize, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-14 w-14 text-base",
  lg: "h-16 w-16 text-xl",
  xl: "h-24 w-24 text-2xl",
};