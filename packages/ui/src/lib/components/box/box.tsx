import React from 'react';
import { cn } from '@inithium/utils';
import { ThemeColor } from '@inithium/types';
import type {
  BaseBoxProps,
  BorderRadius,
  BorderWidth,
  Display,
  FlexAlign,
  FlexContent,
  FlexDirection,
  FlexJustify,
  FlexWrap,
  GapScale,
  Overflow,
  Position,
  SpacingScale,
} from './box.types';

const DISPLAY_MAP: Record<Display, string> = {
  flex: 'flex',
  'inline-flex': 'inline-flex',
  block: 'block',
  'inline-block': 'inline-block',
  inline: 'inline',
  grid: 'grid',
  hidden: 'hidden',
};

const DIRECTION_MAP: Record<FlexDirection, string> = {
  row: 'flex-row',
  'row-reverse': 'flex-row-reverse',
  col: 'flex-col',
  'col-reverse': 'flex-col-reverse',
};

const WRAP_MAP: Record<FlexWrap, string> = {
  wrap: 'flex-wrap',
  nowrap: 'flex-nowrap',
  'wrap-reverse': 'flex-wrap-reverse',
};

const ALIGN_MAP: Record<FlexAlign, string> = {
  start: 'items-start',
  end: 'items-end',
  center: 'items-center',
  baseline: 'items-baseline',
  stretch: 'items-stretch',
};

const JUSTIFY_MAP: Record<FlexJustify, string> = {
  start: 'justify-start',
  end: 'justify-end',
  center: 'justify-center',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

const CONTENT_MAP: Record<FlexContent, string> = {
  start: 'content-start',
  end: 'content-end',
  center: 'content-center',
  between: 'content-between',
  around: 'content-around',
  evenly: 'content-evenly',
  stretch: 'content-stretch',
};

const POSITION_MAP: Record<Position, string> = {
  static: 'static',
  relative: 'relative',
  absolute: 'absolute',
  fixed: 'fixed',
  sticky: 'sticky',
};

const ROUNDED_MAP: Record<BorderRadius, string> = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
  full: 'rounded-full',
};

const BORDER_WIDTH_MAP: Record<BorderWidth, string> = {
  '0': 'border-0',
  '1': 'border',
  '2': 'border-2',
  '4': 'border-4',
  '8': 'border-8',
};

const OVERFLOW_MAP: Record<Overflow, string> = {
  auto: 'overflow-auto',
  hidden: 'overflow-hidden',
  visible: 'overflow-visible',
  scroll: 'overflow-scroll',
  clip: 'overflow-clip',
};

const OVERFLOW_X_MAP: Record<Overflow, string> = {
  auto: 'overflow-x-auto',
  hidden: 'overflow-x-hidden',
  visible: 'overflow-x-visible',
  scroll: 'overflow-x-scroll',
  clip: 'overflow-x-clip',
};

const OVERFLOW_Y_MAP: Record<Overflow, string> = {
  auto: 'overflow-y-auto',
  hidden: 'overflow-y-hidden',
  visible: 'overflow-y-visible',
  scroll: 'overflow-y-scroll',
  clip: 'overflow-y-clip',
};

const BG_MAP: Record<ThemeColor, string> = {
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  accent: 'bg-accent',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
  surface2: 'bg-surface2',
};

const BORDER_COLOR_MAP: Record<ThemeColor, string> = {
  primary: 'border-primary',
  secondary: 'border-secondary',
  accent: 'border-accent',
  success: 'border-success',
  warning: 'border-warning',
  danger: 'border-danger',
  info: 'border-info',
  surface2: 'border-surface2',
};

type SpacingPrefix =
  | 'p' | 'px' | 'py' | 'pt' | 'pr' | 'pb' | 'pl'
  | 'm' | 'mx' | 'my' | 'mt' | 'mr' | 'mb' | 'ml';

const spacingClass = (prefix: SpacingPrefix, value?: SpacingScale): string =>
  value !== undefined ? `${prefix}-${value}` : '';

const gapClass = (value?: GapScale): string =>
  value !== undefined ? `gap-${value}` : '';

const gapXClass = (value?: GapScale): string =>
  value !== undefined ? `gap-x-${value}` : '';

const gapYClass = (value?: GapScale): string =>
  value !== undefined ? `gap-y-${value}` : '';

export const Box: React.FC<BaseBoxProps> = ({
  as: Tag = 'div',
  display = 'flex',
  position,
  fullWidth,
  fullHeight,
  direction = 'row',
  wrap,
  align,
  justify,
  content,
  grow,
  shrink,
  flex,
  p, px, py, pt, pr, pb, pl,
  m, mx, my, mt, mr, mb, ml,
  gap, gapX, gapY,
  bg,
  border,
  borderColor,
  borderWidth = '1',
  rounded,
  overflow,
  overflowX,
  overflowY,
  className = '',
  style,
  children,
  ...props
}) => {
  const classes = cn(
    DISPLAY_MAP[display],
    DIRECTION_MAP[direction],
    wrap && WRAP_MAP[wrap],
    align && ALIGN_MAP[align],
    justify && JUSTIFY_MAP[justify],
    content && CONTENT_MAP[content],
    grow && 'flex-grow',
    shrink === false ? 'flex-shrink-0' : undefined,
    flex && 'flex-1',
    position && POSITION_MAP[position],
    fullWidth && 'w-full',
    fullHeight && 'h-full',
    spacingClass('p', p),
    spacingClass('px', px),
    spacingClass('py', py),
    spacingClass('pt', pt),
    spacingClass('pr', pr),
    spacingClass('pb', pb),
    spacingClass('pl', pl),
    spacingClass('m', m),
    spacingClass('mx', mx),
    spacingClass('my', my),
    spacingClass('mt', mt),
    spacingClass('mr', mr),
    spacingClass('mb', mb),
    spacingClass('ml', ml),
    gapClass(gap),
    gapXClass(gapX),
    gapYClass(gapY),
    bg && BG_MAP[bg],
    border && BORDER_WIDTH_MAP[borderWidth],
    border && borderColor && BORDER_COLOR_MAP[borderColor],
    rounded && ROUNDED_MAP[rounded],
    overflow && OVERFLOW_MAP[overflow],
    overflowX && OVERFLOW_X_MAP[overflowX],
    overflowY && OVERFLOW_Y_MAP[overflowY],
    className,
  );

  return (
    <Tag {...props} style={style} className={classes}>
      {children}
    </Tag>
  );
};