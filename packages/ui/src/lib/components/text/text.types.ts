import React from 'react';
import type { TextDecoration, TextSize, TextStyle, TextWeight, ThemeColor, ThemeFont } from '@inithium/types';

export type TextAs =
  | 'p'
  | 'span'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'label'
  | 'strong'
  | 'em'
  | 'small'
  | 'blockquote'
  | 'figcaption'
  | 'legend'
  | 'dt'
  | 'dd'
  | 'li';
  
export interface BaseTextProps
  extends React.HTMLAttributes<HTMLElement> {
  as?: TextAs;
  color?: ThemeColor;
  font?: ThemeFont;
  size?: TextSize;
  weight?: TextWeight;
  fontStyle?: TextStyle;
  decoration?: TextDecoration;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}
