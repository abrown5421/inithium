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
