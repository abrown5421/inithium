import { HTMLAttributes } from "react";
import { ThemeFont } from "./typography.types.js";

export interface AvatarOptions {
  gradient?: string;
  font?: ThemeFont;
  variant?: 'square' | 'circular';
}

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  initials?: string;
  large?: boolean;
  alt?: string;
  options?: AvatarOptions;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
}
