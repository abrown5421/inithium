import React from 'react';
import type { ThemeColor } from '@inithium/types';

export type BoxAs =
  | 'div'
  | 'section'
  | 'article'
  | 'aside'
  | 'header'
  | 'footer'
  | 'main'
  | 'nav'
  | 'figure'
  | 'form'
  | 'ul'
  | 'ol'
  | 'li';

export type FlexDirection =
  | 'row'
  | 'row-reverse'
  | 'col'
  | 'col-reverse';

export type FlexWrap =
  | 'wrap'
  | 'nowrap'
  | 'wrap-reverse';

export type FlexAlign =
  | 'start'
  | 'end'
  | 'center'
  | 'baseline'
  | 'stretch';

export type FlexJustify =
  | 'start'
  | 'end'
  | 'center'
  | 'between'
  | 'around'
  | 'evenly';

export type FlexContent =
  | 'start'
  | 'end'
  | 'center'
  | 'between'
  | 'around'
  | 'evenly'
  | 'stretch';

export type SpacingScale =
  | '0'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | '11'
  | '12'
  | '14'
  | '16'
  | '20'
  | '24'
  | '28'
  | '32'
  | '36'
  | '40'
  | '44'
  | '48'
  | '52'
  | '56'
  | '60'
  | '64'
  | '72'
  | '80'
  | '96'
  | 'px'
  | 'auto';

export type GapScale = Exclude<SpacingScale, 'auto'>;

export type BorderRadius =
  | 'none'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | 'full';

export type BorderWidth =
  | '0'
  | '1'
  | '2'
  | '4'
  | '8';

export type Overflow =
  | 'auto'
  | 'hidden'
  | 'visible'
  | 'scroll'
  | 'clip';

export type Position =
  | 'static'
  | 'relative'
  | 'absolute'
  | 'fixed'
  | 'sticky';

export type Display =
  | 'flex'
  | 'inline-flex'
  | 'block'
  | 'inline-block'
  | 'inline'
  | 'grid'
  | 'hidden';

export interface BaseBoxProps extends React.HTMLAttributes<HTMLElement> {
  as?: BoxAs;
  display?: Display;
  position?: Position;
  fullWidth?: boolean;
  fullHeight?: boolean;
  direction?: FlexDirection;
  wrap?: FlexWrap;
  align?: FlexAlign;
  justify?: FlexJustify;
  content?: FlexContent;
  grow?: boolean;
  shrink?: boolean;
  flex?: boolean;
  p?: SpacingScale;
  px?: SpacingScale;
  py?: SpacingScale;
  pt?: SpacingScale;
  pr?: SpacingScale;
  pb?: SpacingScale;
  pl?: SpacingScale;
  m?: SpacingScale;
  mx?: SpacingScale;
  my?: SpacingScale;
  mt?: SpacingScale;
  mr?: SpacingScale;
  mb?: SpacingScale;
  ml?: SpacingScale;
  gap?: GapScale;
  gapX?: GapScale;
  gapY?: GapScale;
  bg?: ThemeColor;
  color?: ThemeColor;
  border?: boolean;
  borderColor?: ThemeColor;
  borderWidth?: BorderWidth;
  rounded?: BorderRadius;
  overflow?: Overflow;
  overflowX?: Overflow;
  overflowY?: Overflow;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}