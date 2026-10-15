/*
 * The page builder's plain-language values (decision 0116): named spacing steps, and the four sides of padding and
 * margin as one value or four.
 */

/** Spacing as named steps, with Custom for any other pixel value. */
export const SPACING_STEPS = [
  { label: 'None', px: 0 },
  { label: 'XS', px: 4 },
  { label: 'S', px: 8 },
  { label: 'M', px: 16 },
  { label: 'L', px: 24 },
  { label: 'XL', px: 48 },
  { label: '2XL', px: 96 },
] as const;

/** The step a pixel value is, if it's one. */
export const spacingStep = (px: number | undefined) => SPACING_STEPS.find((step) => step.px === px);

/** Padding or margin: `{ all, x, y, top, right, bottom, left }`, specific keys winning over general ones. */
export type Sides = { all?: number; x?: number; y?: number; top?: number; right?: number; bottom?: number; left?: number };

export type FourSides = { top?: number; right?: number; bottom?: number; left?: number };

/** Each side's value, resolving `all`, `x` and `y`. */
export function resolveSides(value: Sides | undefined): FourSides {
  if (!value) return {};
  return {
    top: value.top ?? value.y ?? value.all,
    right: value.right ?? value.x ?? value.all,
    bottom: value.bottom ?? value.y ?? value.all,
    left: value.left ?? value.x ?? value.all,
  };
}

/** Whether every side is the same (or none is set). */
export function sidesMatch(value: Sides | undefined): boolean {
  const { top, right, bottom, left } = resolveSides(value);
  return top === right && right === bottom && bottom === left;
}

/** One value for every side, or nothing. */
export const allSides = (px: number | undefined): Sides | undefined => (px === undefined ? undefined : { all: px });

/** Four sides as stored: the same on all becomes `{ all }`, nothing set becomes undefined. */
export function storeSides(sides: FourSides): Sides | undefined {
  const { top, right, bottom, left } = sides;
  if (top === right && right === bottom && bottom === left) return allSides(top);
  const stored = Object.fromEntries(Object.entries(sides).filter(([, px]) => px !== undefined)) as Sides;
  return Object.keys(stored).length ? stored : undefined;
}

/** The fractions a size can take, named as people say them. */
export const SIZE_FRACTIONS = [
  { value: '1/2', label: 'Half' },
  { value: '1/3', label: 'A third' },
  { value: '2/3', label: 'Two thirds' },
  { value: '1/4', label: 'A quarter' },
  { value: '3/4', label: 'Three quarters' },
] as const;
