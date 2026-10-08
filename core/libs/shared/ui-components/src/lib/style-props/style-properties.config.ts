/**
 * Every CSS property the style props can set (decisions 0034 and 0047). Each entry gets one class per
 * variant key (e.g. .ui-bg, .ui-bg-hover, .ui-bg-md-hover), whose rule reads a CSS variable of the same name
 * that the resolver sets inline. Adding a style property means adding an entry here and resolving it in
 * style-props.service.ts.
 */
export const styleProperties = {
  // colours
  bg: ['background-color'],
  text: ['color'],
  'border-color': ['border-color'],
  // Sets an intermediate, non-inherited property that the shadow presets read.
  'shadow-color': ['--ui-shadow-color'],

  // spacing
  pt: ['padding-top'],
  pr: ['padding-right'],
  pb: ['padding-bottom'],
  pl: ['padding-left'],
  mt: ['margin-top'],
  mr: ['margin-right'],
  mb: ['margin-bottom'],
  ml: ['margin-left'],

  // sizing
  w: ['width'],
  h: ['height'],
  'min-w': ['min-width'],
  'max-w': ['max-width'],
  'min-h': ['min-height'],
  'max-h': ['max-height'],

  // borders and shadow
  'border-t': ['border-top-width'],
  'border-r': ['border-right-width'],
  'border-b': ['border-bottom-width'],
  'border-l': ['border-left-width'],
  'border-style': ['border-style'],
  'radius-tl': ['border-top-left-radius'],
  'radius-tr': ['border-top-right-radius'],
  'radius-br': ['border-bottom-right-radius'],
  'radius-bl': ['border-bottom-left-radius'],
  shadow: ['box-shadow'],

  // typography
  font: ['font-family'],
  'font-size': ['font-size'],
  'font-weight': ['font-weight'],
  'text-align': ['text-align'],
  leading: ['line-height'],
  tracking: ['letter-spacing'],
  clamp: ['display', 'overflow', '-webkit-box-orient', '-webkit-line-clamp'],

  // layout
  display: ['display'],
  'flex-direction': ['flex-direction'],
  'flex-wrap': ['flex-wrap'],
  'align-items': ['align-items'],
  'justify-content': ['justify-content'],
  'justify-items': ['justify-items'],
  'gap-x': ['column-gap'],
  'gap-y': ['row-gap'],
  'grid-cols': ['grid-template-columns'],
  'grid-rows': ['grid-template-rows'],
  position: ['position'],
  top: ['top'],
  right: ['right'],
  bottom: ['bottom'],
  left: ['left'],
  z: ['z-index'],
  'overflow-x': ['overflow-x'],
  'overflow-y': ['overflow-y'],
  grow: ['flex-grow'],
  shrink: ['flex-shrink'],
  basis: ['flex-basis'],
  self: ['align-self'],
  order: ['order'],
  'col-span': ['grid-column'],
  'row-span': ['grid-row'],
} as const satisfies Record<string, readonly string[]>;

export type StyleProperty = keyof typeof styleProperties;

/** Custom properties that must not inherit, so a child doesn't pick up its parent's value. */
export const nonInheritedProperties = ['--ui-shadow-color'] as const;

/** Tailwind's default breakpoints (min-widths). */
export const breakpointMinWidths = { sm: '40rem', md: '48rem', lg: '64rem', xl: '80rem', '2xl': '96rem' } as const;

/** Tailwind's shadow sizes. The colour slot falls back to Tailwind's default black when no shadowColor is set. */
const shadowColor = (fallbackAlpha: number) => `var(--ui-shadow-color, rgb(0 0 0 / ${fallbackAlpha}))`;
export const shadowPresets = {
  none: 'none',
  '2xs': `0 1px ${shadowColor(0.05)}`,
  xs: `0 1px 2px 0 ${shadowColor(0.05)}`,
  sm: `0 1px 3px 0 ${shadowColor(0.1)}, 0 1px 2px -1px ${shadowColor(0.1)}`,
  md: `0 4px 6px -1px ${shadowColor(0.1)}, 0 2px 4px -2px ${shadowColor(0.1)}`,
  lg: `0 10px 15px -3px ${shadowColor(0.1)}, 0 4px 6px -4px ${shadowColor(0.1)}`,
  xl: `0 20px 25px -5px ${shadowColor(0.1)}, 0 8px 10px -6px ${shadowColor(0.1)}`,
  '2xl': `0 25px 50px -12px ${shadowColor(0.25)}`,
} as const;
