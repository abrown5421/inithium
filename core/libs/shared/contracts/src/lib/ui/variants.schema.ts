import { z } from 'zod';

/** Tailwind's default breakpoints, smallest first. */
export const breakpoints = ['sm', 'md', 'lg', 'xl', '2xl'] as const;

/** Interaction states a style prop can target. `focus` means :focus-visible. */
export const states = ['hover', 'focus', 'active', 'disabled'] as const;

export type Breakpoint = (typeof breakpoints)[number];
export type State = (typeof states)[number];
export type VariantKey = 'base' | Breakpoint | State | `${Breakpoint}:${State}`;

/** Every variant key, in cascade order: base, base states, then each breakpoint with its states. */
export const variantKeys: readonly VariantKey[] = [
  'base',
  ...states,
  ...breakpoints.flatMap((breakpoint) => [breakpoint, ...states.map((state) => `${breakpoint}:${state}` as const)]),
];

export type Variants<T> = T | { [K in VariantKey]?: T };

/**
 * A style value, or an object of variant keys mapping to that value:
 * `{ base, hover, md, 'md:hover', … }` (see decision 0036).
 * Value object schemas must be strict so they can't be mistaken for a variant object.
 */
export function withVariants<T extends z.ZodType>(value: T) {
  const shape = Object.fromEntries(variantKeys.map((key) => [key, value.optional()])) as {
    [K in VariantKey]: z.ZodOptional<T>;
  };
  return z.union([value, z.object(shape).strict()]);
}
