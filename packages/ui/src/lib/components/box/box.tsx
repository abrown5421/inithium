import React, { useEffect, useRef, useState } from 'react';
import { cn, BG_COLOR_MAP, BORDER_COLOR_MAP, TEXT_COLOR_MAP } from '@inithium/utils';
import { AnimationObject } from '@inithium/types';
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

const SPACING_VALUES: SpacingScale[] = [
  '0','1','2','3','4','5','6','7','8','9','10','11','12',
  '14','16','20','24','28','32','36','40','44','48','52',
  '56','60','64','72','80','96','px','auto',
];

const GAP_VALUES: GapScale[] = [
  '0','1','2','3','4','5','6','7','8','9','10','11','12',
  '14','16','20','24','28','32','36','40','44','48','52',
  '56','60','64','72','80','96','px',
];

type SpacingPrefix = 'p'|'px'|'py'|'pt'|'pr'|'pb'|'pl'|'m'|'mx'|'my'|'mt'|'mr'|'mb'|'ml';
type GapPrefix = 'gap' | 'gap-x' | 'gap-y';

export const SPACING_MAP = Object.fromEntries(
  (['p','px','py','pt','pr','pb','pl','m','mx','my','mt','mr','mb','ml'] as SpacingPrefix[])
    .map(prefix => [
      prefix,
      Object.fromEntries(SPACING_VALUES.map(v => [v, `${prefix}-${v}`]))
    ])
) as Record<SpacingPrefix, Record<SpacingScale, string>>;

export const GAP_MAP = Object.fromEntries(
  (['gap','gap-x','gap-y'] as GapPrefix[])
    .map(prefix => [
      prefix,
      Object.fromEntries(GAP_VALUES.map(v => [v, `${prefix}-${v}`]))
    ])
) as Record<GapPrefix, Record<GapScale, string>>;

const spacingClass = (prefix: SpacingPrefix, value?: SpacingScale): string =>
  value !== undefined ? `${prefix}-${value}` : '';

const gapClass = (value?: GapScale): string =>
  value !== undefined ? `gap-${value}` : '';

const gapXClass = (value?: GapScale): string =>
  value !== undefined ? `gap-x-${value}` : '';

const gapYClass = (value?: GapScale): string =>
  value !== undefined ? `gap-y-${value}` : '';

type ExtendedBoxProps = BaseBoxProps & {
  animation?: AnimationObject;
};

const buildAnimationClass = (
  name: string,
  delay?: string,
  speed?: string,
) =>
  cn(
    'animate__animated',
    `animate__${name}`,
    delay && `animate__${delay}`,
    speed && `animate__${speed}`,
  );

export const Box: React.FC<ExtendedBoxProps> = ({
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
  color,
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
  animation,
  ...props
}) => {
  const [renderedChildren, setRenderedChildren] = useState(children);
  const [animClass, setAnimClass] = useState('');
  const ref = useRef<any>(null);
  const prevChildren = useRef(children);

  useEffect(() => {
    if (!animation) {
      setRenderedChildren(children);
      return;
    }

    if (children === prevChildren.current) return;

    const run = async () => {
      if (animation.controller?.triggerExit) {
        setAnimClass(
          buildAnimationClass(
            animation.exit,
            animation.exitDelay,
            animation.exitSpeed,
          ),
        );
        await animation.controller.triggerExit();
      }

      setRenderedChildren(children);

      if (animation.controller?.triggerEnter) {
        setAnimClass(
          buildAnimationClass(
            animation.entry,
            animation.entryDelay,
            animation.entrySpeed,
          ),
        );
        animation.controller.triggerEnter();
      }
    };

    run();
    prevChildren.current = children;
  }, [children, animation]);

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
    p  && SPACING_MAP['p'][p],
    px && SPACING_MAP['px'][px],
    py && SPACING_MAP['py'][py],
    pt && SPACING_MAP['pt'][pt],
    pr && SPACING_MAP['pr'][pr],
    pb && SPACING_MAP['pb'][pb],
    pl && SPACING_MAP['pl'][pl],
    m  && SPACING_MAP['m'][m],
    mx && SPACING_MAP['mx'][mx],
    my && SPACING_MAP['my'][my],
    mt && SPACING_MAP['mt'][mt],
    mr && SPACING_MAP['mr'][mr],
    mb && SPACING_MAP['mb'][mb],
    ml && SPACING_MAP['ml'][ml],
    gap  && GAP_MAP['gap'][gap],
    gapX && GAP_MAP['gap-x'][gapX],
    gapY && GAP_MAP['gap-y'][gapY],
    bg && BG_COLOR_MAP[bg],
    color && TEXT_COLOR_MAP[color]?.text,
    border && BORDER_WIDTH_MAP[borderWidth],
    border && borderColor && BORDER_COLOR_MAP[borderColor],
    rounded && ROUNDED_MAP[rounded],
    overflow && OVERFLOW_MAP[overflow],
    overflowX && OVERFLOW_X_MAP[overflowX],
    overflowY && OVERFLOW_Y_MAP[overflowY],
    animClass,
    className,
  );

  return (
    <Tag ref={ref} {...props} style={style} className={classes}>
      {renderedChildren}
    </Tag>
  );
};
