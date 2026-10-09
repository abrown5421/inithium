import type { CSSProperties } from 'react';
import {
  variantKeys,
  type ButtonStyleProps,
  type ButtonVariant,
  type CheckboxStyleProps,
  type ColorValue,
  type ContainerStyleProps,
  type DividerStyleProps,
  type IconStyleProps,
  type InputStyleProps,
  type LoaderStyleProps,
  type RadioGroupStyleProps,
  type SharedStyleProps,
  type SliderStyleProps,
  type SolidColorValue,
  type SwitchStyleProps,
  type TextStyleProps,
  type VariantKey,
  type Variants,
} from '@inithium/shared-contracts';
import { shadowPresets, styleProperties, type StyleProperty } from './style-properties.config';
import { styleClassName, styleVariableName } from './style-sheet.service';

type Value = string | readonly string[];
type Size = NonNullable<SharedStyleProps['width']> extends Variants<infer T> ? T : never;

const variantKeySet = new Set<string>(variantKeys);

/** True for `{ base, hover, md, … }`. Value objects (colours, sides, corners) never use variant keys. */
function isVariantMap<T>(value: Variants<T>): value is { [K in VariantKey]?: T } {
  return typeof value === 'object' && value !== null && Object.keys(value).some((key) => variantKeySet.has(key));
}

/** Normalises a prop to [variant key, value] pairs. */
function entries<T>(value: Variants<T> | undefined): [VariantKey, T][] {
  if (value === undefined) return [];
  if (isVariantMap(value)) {
    return variantKeys.flatMap((key) => (value[key] === undefined ? [] : [[key, value[key] as T] as [VariantKey, T]]));
  }
  return [['base', value as T]];
}

/** Collects style property values per variant key, then renders classes and inline variables. */
class StyleBuilder {
  private readonly values = new Map<StyleProperty, Map<VariantKey, Value>>();

  set(property: StyleProperty, key: VariantKey, value: Value | undefined): void {
    if (value === undefined) return;
    if (!this.values.has(property)) this.values.set(property, new Map());
    this.values.get(property)?.set(key, value);
  }

  each<T>(prop: Variants<T> | undefined, apply: (key: VariantKey, value: T) => void): void {
    for (const [key, value] of entries(prop)) apply(key, value);
  }

  build(): { className: string; style: CSSProperties } {
    const classNames: string[] = [];
    const style: Record<string, string> = {};
    for (const [property, byKey] of this.values) {
      for (const [key, value] of byKey) {
        classNames.push(styleClassName(property, key));
        const parts = typeof value === 'string' ? [value] : value;
        styleProperties[property].forEach((_, index) => {
          style[styleVariableName(property, index, key)] = parts[index];
        });
      }
    }
    return { className: classNames.join(' '), style: style as CSSProperties };
  }
}

// --- value conversion ---

const px = (value: number) => `${value}px`;

function color(value: ColorValue): string {
  if (value === 'transparent') return 'transparent';
  if (typeof value === 'string') return `var(--color-${value}-500)`;
  const base = `var(--color-${value.color}-${value.intensity})`;
  return value.opacity === undefined ? base : `color-mix(in oklab, ${base} ${value.opacity}%, transparent)`;
}

function size(value: Size, axis: 'width' | 'height'): string {
  if (typeof value === 'number') return px(value);
  if (value === 'full') return '100%';
  if (value === 'screen') return axis === 'width' ? '100vw' : '100dvh';
  if (value === 'auto') return 'auto';
  if (value === 'fit') return 'fit-content';
  const [numerator, denominator] = value.split('/');
  return `calc(100% * ${numerator} / ${denominator})`;
}

type Sides = { all?: number; x?: number; y?: number; top?: number; right?: number; bottom?: number; left?: number };

/** A side overrides x/y, which override all (decision 0042). */
function sides(value: Sides) {
  return {
    top: value.top ?? value.y ?? value.all,
    right: value.right ?? value.x ?? value.all,
    bottom: value.bottom ?? value.y ?? value.all,
    left: value.left ?? value.x ?? value.all,
  };
}

const flexAlignment: Record<string, string> = {
  start: 'flex-start',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
};

// --- shared props ---

const sizeProps = [
  ['width', 'w', 'width'],
  ['height', 'h', 'height'],
  ['minWidth', 'min-w', 'width'],
  ['maxWidth', 'max-w', 'width'],
  ['minHeight', 'min-h', 'height'],
  ['maxHeight', 'max-h', 'height'],
] as const;

function applyShared(builder: StyleBuilder, props: SharedStyleProps): void {
  builder.each(props.bgColor, (key, value) => builder.set('bg', key, color(value)));
  builder.each(props.textColor, (key, value) => builder.set('text', key, color(value)));
  builder.each(props.borderColor, (key, value) => builder.set('border-color', key, color(value)));
  builder.each(props.shadowColor, (key, value) => builder.set('shadow-color', key, color(value)));

  builder.each(props.padding, (key, value) => {
    const { top, right, bottom, left } = sides(value);
    builder.set('pt', key, top === undefined ? undefined : px(top));
    builder.set('pr', key, right === undefined ? undefined : px(right));
    builder.set('pb', key, bottom === undefined ? undefined : px(bottom));
    builder.set('pl', key, left === undefined ? undefined : px(left));
  });
  builder.each(props.margin, (key, value) => {
    const { top, right, bottom, left } = sides(value);
    builder.set('mt', key, top === undefined ? undefined : px(top));
    builder.set('mr', key, right === undefined ? undefined : px(right));
    builder.set('mb', key, bottom === undefined ? undefined : px(bottom));
    builder.set('ml', key, left === undefined ? undefined : px(left));
  });

  for (const [prop, property, axis] of sizeProps) {
    builder.each(props[prop], (key, value) => builder.set(property, key, size(value, axis)));
  }

  builder.each(props.borderWidth, (key, value) => {
    const { top, right, bottom, left } = sides(value);
    builder.set('border-t', key, top === undefined ? undefined : px(top));
    builder.set('border-r', key, right === undefined ? undefined : px(right));
    builder.set('border-b', key, bottom === undefined ? undefined : px(bottom));
    builder.set('border-l', key, left === undefined ? undefined : px(left));
  });
  builder.each(props.borderStyle, (key, value) => builder.set('border-style', key, value));
  builder.each(props.radius, (key, value) => {
    // A corner wins, then top/bottom, then left/right, then all.
    const corner = (own?: number, vertical?: number, horizontal?: number) => {
      const resolved = own ?? vertical ?? horizontal ?? value.all;
      return resolved === undefined ? undefined : px(resolved);
    };
    builder.set('radius-tl', key, corner(value.topLeft, value.top, value.left));
    builder.set('radius-tr', key, corner(value.topRight, value.top, value.right));
    builder.set('radius-br', key, corner(value.bottomRight, value.bottom, value.right));
    builder.set('radius-bl', key, corner(value.bottomLeft, value.bottom, value.left));
  });
  builder.each(props.shadow, (key, value) => builder.set('shadow', key, shadowPresets[value]));
}

// --- Container ---

/** Keys present in any of the given variant props, in cascade order. */
function keysOf(...props: (Variants<unknown> | undefined)[]): VariantKey[] {
  const present = new Set(props.flatMap((prop) => entries(prop).map(([key]) => key)));
  return variantKeys.filter((key) => present.has(key));
}

function valueAt<T>(prop: Variants<T> | undefined, key: VariantKey): T | undefined {
  return entries(prop).find(([entryKey]) => entryKey === key)?.[1];
}

function applyContainer(builder: StyleBuilder, props: ContainerStyleProps): void {
  const { flex, grid, position, overflow, flexItem, gridItem, hidden } = props;

  // display comes from flex/grid, overridden per key by hidden.
  const shown = flex ? 'flex' : grid ? 'grid' : undefined;
  for (const key of keysOf(hidden, shown)) {
    const isHidden = valueAt(hidden, key);
    if (isHidden === true) builder.set('display', key, 'none');
    else if (isHidden === false) builder.set('display', key, shown ?? 'revert-layer');
    else if (key === 'base' && shown) builder.set('display', key, shown);
  }

  const gap = (value: number | { x?: number; y?: number }, key: VariantKey) => {
    const x = typeof value === 'number' ? value : value.x;
    const y = typeof value === 'number' ? value : value.y;
    builder.set('gap-x', key, x === undefined ? undefined : px(x));
    builder.set('gap-y', key, y === undefined ? undefined : px(y));
  };

  if (flex) {
    builder.each(flex.direction, (key, value) => builder.set('flex-direction', key, value));
    builder.each(flex.wrap, (key, value) => builder.set('flex-wrap', key, value));
    builder.each(flex.align, (key, value) => builder.set('align-items', key, flexAlignment[value] ?? value));
    builder.each(flex.justify, (key, value) => builder.set('justify-content', key, flexAlignment[value] ?? value));
    builder.each(flex.gap, (key, value) => gap(value, key));
  }

  if (grid) {
    const tracks = (count: number) => `repeat(${count}, minmax(0, 1fr))`;
    builder.each(grid.columns, (key, value) => builder.set('grid-cols', key, tracks(value)));
    builder.each(grid.rows, (key, value) => builder.set('grid-rows', key, tracks(value)));
    builder.each(grid.align, (key, value) => builder.set('align-items', key, value));
    builder.each(grid.justify, (key, value) => builder.set('justify-items', key, value));
    builder.each(grid.gap, (key, value) => gap(value, key));
  }

  if (position) {
    builder.each(position.type, (key, value) => builder.set('position', key, value));
    builder.each(position.z, (key, value) => builder.set('z', key, String(value)));
    const { all, x, y, top, right, bottom, left } = position;
    for (const key of keysOf(all, x, y, top, right, bottom, left)) {
      const at = <T,>(prop: Variants<T> | undefined) => valueAt(prop, key);
      const offset = (side?: number, axis?: number) => {
        const resolved = side ?? axis ?? at(all);
        return resolved === undefined ? undefined : px(resolved);
      };
      builder.set('top', key, offset(at(top), at(y)));
      builder.set('right', key, offset(at(right), at(x)));
      builder.set('bottom', key, offset(at(bottom), at(y)));
      builder.set('left', key, offset(at(left), at(x)));
    }
  }

  if (overflow) {
    for (const key of keysOf(overflow.all, overflow.x, overflow.y)) {
      builder.set('overflow-x', key, valueAt(overflow.x, key) ?? valueAt(overflow.all, key));
      builder.set('overflow-y', key, valueAt(overflow.y, key) ?? valueAt(overflow.all, key));
    }
  }

  if (flexItem) {
    builder.each(flexItem.grow, (key, value) => builder.set('grow', key, String(value)));
    builder.each(flexItem.shrink, (key, value) => builder.set('shrink', key, String(value)));
    builder.each(flexItem.basis, (key, value) => builder.set('basis', key, size(value, 'width')));
    builder.each(flexItem.alignSelf, (key, value) => builder.set('self', key, flexAlignment[value] ?? value));
    builder.each(flexItem.order, (key, value) => builder.set('order', key, String(value)));
  }

  if (gridItem) {
    const span = (value: number | 'full') => (value === 'full' ? '1 / -1' : `span ${value} / span ${value}`);
    builder.each(gridItem.colSpan, (key, value) => builder.set('col-span', key, span(value)));
    builder.each(gridItem.rowSpan, (key, value) => builder.set('row-span', key, span(value)));
    builder.each(gridItem.alignSelf, (key, value) => builder.set('self', key, value));
  }
}

// --- Text ---

function applyText(builder: StyleBuilder, props: TextStyleProps): void {
  builder.each(props.fontFamily, (key, value) => builder.set('font', key, `var(--font-${value})`));
  builder.each(props.fontSize, (key, value) => builder.set('font-size', key, px(value)));
  builder.each(props.fontWeight, (key, value) => builder.set('font-weight', key, String(value)));
  builder.each(props.align, (key, value) => builder.set('text-align', key, value));
  builder.each(props.lineHeight, (key, value) => builder.set('leading', key, String(value)));
  builder.each(props.letterSpacing, (key, value) => builder.set('tracking', key, px(value)));
  builder.each(props.truncate, (key, value) =>
    builder.set(
      'clamp',
      key,
      value === false
        ? ['revert-layer', 'visible', 'revert-layer', 'none']
        : ['-webkit-box', 'hidden', 'vertical', String(value)],
    ),
  );
}

// --- Button ---

type ColorMap = { [K in VariantKey]?: string };

/** The colour's 100 step, without opacity: the light text filled and outlined buttons put on the colour. */
function lightOf(value: SolidColorValue): string {
  return `var(--color-${typeof value === 'string' ? value : value.color}-100)`;
}

/** Each variant's colours (decision 0054). */
function variantColors(variant: ButtonVariant, value: SolidColorValue): Record<'bg' | 'text' | 'border-color', ColorMap> {
  const main = color(value);
  const light = lightOf(value);
  switch (variant) {
    case 'filled':
      return { bg: { base: main, hover: 'transparent' }, text: { base: light, hover: main }, 'border-color': { base: main } };
    case 'outlined':
      return { bg: { base: 'transparent', hover: main }, text: { base: main, hover: light }, 'border-color': { base: main } };
    case 'ghost':
      return {
        bg: { base: 'transparent', hover: 'var(--color-surface-200)' },
        text: { base: main },
        'border-color': { base: 'transparent' },
      };
    case 'link':
      return { bg: { base: 'transparent' }, text: { base: main }, 'border-color': { base: 'transparent' } };
  }
}

/** Fixed button metrics: 32px tall, 12px side padding, 6px radius, 2px border. Links sit inline instead. */
const BUTTON_HEIGHT = 32;
const BUTTON_PADDING_X = 12;
const BUTTON_RADIUS = 6;
const BUTTON_BORDER = 2;

/**
 * Resolves a Button. The variant's colours come first and the caller's bgColor, textColor and borderColor
 * override them per variant key; each colour holds its base value while disabled unless told otherwise.
 * `accent` is the button's colour, for its focus outline.
 */
export function resolveButtonStyles(props: ButtonStyleProps) {
  const { variant = 'filled', color: value = 'primary' } = props;
  const isLink = variant === 'link';
  const builder = new StyleBuilder();

  applyShared(builder, {
    margin: props.margin,
    padding: props.padding ?? (isLink ? undefined : { x: BUTTON_PADDING_X }),
    width: props.width,
    minWidth: props.minWidth,
    maxWidth: props.maxWidth,
    height: isLink ? undefined : BUTTON_HEIGHT,
    radius: isLink ? undefined : { all: BUTTON_RADIUS },
    borderWidth: { all: isLink ? 0 : BUTTON_BORDER },
  });

  const defaults = variantColors(variant, value);
  const overrides = { bg: props.bgColor, text: props.textColor, 'border-color': props.borderColor };
  for (const property of ['bg', 'text', 'border-color'] as const) {
    const merged: ColorMap = { ...defaults[property] };
    for (const [key, override] of entries(overrides[property])) merged[key] = color(override);
    merged.disabled ??= merged.base;
    for (const key of variantKeys) builder.set(property, key, merged[key]);
  }

  builder.set('font', 'base', 'var(--font-body)');
  builder.set('font-size', 'base', px(14));
  builder.set('font-weight', 'base', '500');

  return { ...builder.build(), accent: color(value) };
}

// --- Input ---

/** Fixed input metrics: the field matches the button's 32px, with 12px side padding (none for standard). */
const INPUT_HEIGHT = 32;
const INPUT_PADDING_X = 12;
/** The fixed error colour of form fields (decisions 0055 and 0057). */
const FIELD_ERROR_COLOR = 'red' as const;

/**
 * Resolves an Input (decision 0055): the outer element takes margin and width (default full), the field takes
 * the fixed height and padding. The colours are CSS variables read by the input stylesheet: a neutral border
 * at rest, darker on hover, and the accent on focus. An error turns all three red. `accent` is also returned for
 * parts outside the field, such as a Select's list.
 */
export function resolveInputStyles(props: InputStyleProps, error: boolean) {
  const { variant = 'outlined', color: value = 'primary' } = props;

  const root = new StyleBuilder();
  applyShared(root, {
    margin: props.margin,
    width: props.width ?? 'full',
    minWidth: props.minWidth,
    maxWidth: props.maxWidth,
  });
  const field = new StyleBuilder();
  applyShared(field, {
    height: INPUT_HEIGHT,
    padding: props.padding ?? (variant === 'standard' ? undefined : { x: INPUT_PADDING_X }),
  });

  const { className, style } = root.build();
  const accent = color(error ? FIELD_ERROR_COLOR : value);
  const colors = {
    '--ui-input-accent': accent,
    '--ui-input-border': error ? color(FIELD_ERROR_COLOR) : 'var(--color-surface-500)',
    '--ui-input-border-hover': error ? color(FIELD_ERROR_COLOR) : 'var(--color-surface-700)',
  };
  return { root: { className, style: { ...style, ...colors } as CSSProperties }, field: field.build(), accent };
}

// --- Checkbox ---

/**
 * Resolves a Checkbox (decision 0057): margin and padding on the outer element, and the colours as variables
 * read by the checkbox stylesheet: the outline, fill and focus outline, and the light check drawn on the fill.
 * An error turns them red.
 */
export function resolveCheckboxStyles(props: CheckboxStyleProps, error: boolean) {
  const value = error ? FIELD_ERROR_COLOR : (props.color ?? 'primary');
  const builder = new StyleBuilder();
  applyShared(builder, { margin: props.margin, padding: props.padding });
  const { className, style } = builder.build();
  const colors = { '--ui-checkbox-accent': color(value), '--ui-checkbox-on-accent': lightOf(value) };
  return { className, style: { ...style, ...colors } as CSSProperties };
}

// --- RadioGroup ---

/**
 * Resolves a RadioGroup (decision 0061): margin and padding on the outer element, and the accent as a variable
 * read by the radio group stylesheet. An error turns it red.
 */
export function resolveRadioGroupStyles(props: RadioGroupStyleProps, error: boolean) {
  const builder = new StyleBuilder();
  applyShared(builder, { margin: props.margin, padding: props.padding });
  const { className, style } = builder.build();
  const accent = color(error ? FIELD_ERROR_COLOR : (props.color ?? 'primary'));
  return { className, style: { ...style, '--ui-radio-accent': accent } as CSSProperties };
}

// --- Slider ---

/**
 * Resolves a Slider (decision 0063): margin, padding and width (default full) on the outer element, and the
 * accent as a variable read by the slider stylesheet. An error turns it red.
 */
export function resolveSliderStyles(props: SliderStyleProps, error: boolean) {
  const builder = new StyleBuilder();
  applyShared(builder, {
    margin: props.margin,
    padding: props.padding,
    width: props.width ?? 'full',
    minWidth: props.minWidth,
    maxWidth: props.maxWidth,
  });
  const { className, style } = builder.build();
  const accent = color(error ? FIELD_ERROR_COLOR : (props.color ?? 'primary'));
  return { className, style: { ...style, '--ui-slider-accent': accent } as CSSProperties };
}

// --- Switch ---

/**
 * Resolves a Switch (decision 0059): margin and padding on the outer element, and the colours as variables read
 * by the switch stylesheet: the track when on, focus and the thumb's icon (accent), and the thumb when on (the
 * accent's 100 step). An error turns the accent red.
 */
export function resolveSwitchStyles(props: SwitchStyleProps, error: boolean) {
  const value = error ? FIELD_ERROR_COLOR : (props.color ?? 'primary');
  const builder = new StyleBuilder();
  applyShared(builder, { margin: props.margin, padding: props.padding });
  const { className, style } = builder.build();
  const colors = { '--ui-switch-accent': color(value), '--ui-switch-on-accent': lightOf(value) };
  return { className, style: { ...style, ...colors } as CSSProperties };
}

// --- Divider ---

/** A divider's default line: the theme's border role, softened. */
const DIVIDER_COLOR: ColorValue = { color: 'surface', intensity: 500, opacity: 40 };

/**
 * Resolves a Divider (decision 0060): margin on the outer element, padding around the label, and the line as
 * variables read by the divider stylesheet.
 */
export function resolveDividerStyles(props: DividerStyleProps) {
  const root = new StyleBuilder();
  applyShared(root, { margin: props.margin });
  const label = new StyleBuilder();
  applyShared(label, { padding: props.padding });
  const { className, style } = root.build();
  const line = {
    '--ui-divider-color': color(props.color ?? DIVIDER_COLOR),
    '--ui-divider-thickness': px(props.thickness ?? 1),
    '--ui-divider-style': props.lineStyle ?? 'solid',
  };
  return { root: { className, style: { ...style, ...line } as CSSProperties }, label: label.build() };
}

// --- Loader ---

/** Default loader size, matching Icon's. */
export const DEFAULT_LOADER_SIZE = 24;

/**
 * Resolves a Loader (decision 0058): margin and padding, width for the progress bar (default full), and the
 * colour and size as variables read by the loader stylesheet.
 */
export function resolveLoaderStyles(props: LoaderStyleProps) {
  const isProgress = props.variant === 'progress';
  const builder = new StyleBuilder();
  applyShared(builder, {
    margin: props.margin,
    padding: props.padding,
    width: isProgress ? (props.width ?? 'full') : undefined,
  });
  const { className, style } = builder.build();
  const vars = {
    '--ui-loader-color': color(props.color ?? 'primary'),
    '--ui-loader-size': px(props.size ?? DEFAULT_LOADER_SIZE),
  };
  return { className, style: { ...style, ...vars } as CSSProperties };
}

export function resolveContainerStyles(props: ContainerStyleProps) {
  const builder = new StyleBuilder();
  applyShared(builder, props);
  applyContainer(builder, props);
  return builder.build();
}

/** Default icon size, matching Lucide's. */
export const DEFAULT_ICON_SIZE = 24;

export function resolveIconStyles(props: IconStyleProps) {
  const builder = new StyleBuilder();
  applyShared(builder, props);
  // size sets width and height together, after the shared props, so it wins over them.
  const size = props.size ?? (props.width === undefined && props.height === undefined ? DEFAULT_ICON_SIZE : undefined);
  builder.each(size, (key, value) => {
    builder.set('w', key, px(value));
    builder.set('h', key, px(value));
  });
  return builder.build();
}

export function resolveTextStyles(props: TextStyleProps) {
  const builder = new StyleBuilder();
  applyShared(builder, props);
  applyText(builder, props);
  return builder.build();
}
