import React from 'react';
import type { ThemeColor } from '@inithium/types';

export type ThemeFont =
  | 'sans'
  | 'serif'
  | 'mono'
  | 'display'
  | 'body'
  | 'inter-tight'
  | 'plus-jakarta-sans'
  | 'sora'
  | 'dm-sans'
  | 'lora'
  | 'space-grotesk'
  | 'nunito'
  | 'raleway'
  | 'mulish'
  | 'merriweather'
  | 'playfair-display'
  | 'ibm-plex-mono'
  | 'fraunces'
  | 'outfit'
  | 'manrope'
  | 'barlow'
  | 'epilogue'
  | 'libre-baskerville'
  | 'josefin-sans'
  | 'space-mono';

export type TextSize =
  | 'xs'
  | 'sm'
  | 'base'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl'
  | '5xl';

export type TextWeight =
  | 'thin'
  | 'light'
  | 'normal'
  | 'medium'
  | 'semibold'
  | 'bold'
  | 'extrabold'
  | 'black';

export type TextStyle =
  | 'normal'
  | 'italic';

export type TextDecoration =
  | 'none'
  | 'underline'
  | 'line-through'
  | 'overline';

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
