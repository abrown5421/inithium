import { variantKeys, type VariantKey, type Variants } from '@inithium/shared-contracts';
import { sameContent } from './content-tree.service';

/*
 * Editing a style prop per device (decision 0116). Clients design desktop first: a value set on Desktop applies at
 * every size until it's overridden for tablets or phones. Style props cascade mobile first instead (`base`, then
 * `md`, `lg` …), so the editor writes each device's value as a breakpoint variant and clients never see the keys.
 *
 * Phone is `base`, Tablet is `md` (768px) and Desktop is `lg` (1024px) and up.
 */

export type EditDevice = 'desktop' | 'tablet' | 'phone';

/** Each device's preview width, in px. */
export const DEVICE_WIDTHS: Record<EditDevice, number> = { desktop: 1280, tablet: 768, phone: 390 };

export const DEVICE_LABELS: Record<EditDevice, string> = { desktop: 'Desktop', tablet: 'Tablet', phone: 'Phone' };

type VariantMap<T> = { [K in VariantKey]?: T };

const keySet = new Set<string>(variantKeys);
const BREAKPOINT_KEYS = new Set<string>(['base', 'sm', 'md', 'lg', 'xl', '2xl']);

/** Whether a value is `{ base, md, hover, … }` rather than a value itself (value objects never use variant keys). */
export function isVariantMap<T>(value: Variants<T> | undefined): value is VariantMap<T> {
  return typeof value === 'object' && value !== null && !Array.isArray(value) && Object.keys(value).some((key) => keySet.has(key));
}

/** The first of some variant keys with a value. */
const first = <T>(map: VariantMap<T>, keys: VariantKey[]): T | undefined => keys.map((key) => map[key]).find((entry) => entry !== undefined);

/** The value each device shows. */
export function deviceValues<T>(value: Variants<T> | undefined): Record<EditDevice, T | undefined> {
  if (!isVariantMap(value)) return { desktop: value, tablet: value, phone: value };
  return {
    phone: value.base,
    tablet: first(value, ['md', 'sm', 'base']),
    desktop: first(value, ['xl', 'lg', 'md', 'sm', 'base']),
  };
}

/** The value a device shows. */
export const readAt = <T>(value: Variants<T> | undefined, device: EditDevice): T | undefined => deviceValues(value)[device];

/** Whether a device has its own value, rather than the one from the size above it. */
export function isOverridden<T>(value: Variants<T> | undefined, device: EditDevice): boolean {
  const { desktop, tablet, phone } = deviceValues(value);
  if (device === 'tablet') return !sameContent(tablet, desktop);
  if (device === 'phone') return !sameContent(phone, tablet);
  return false;
}

/** The state keys (hover, focus, `md:hover` …), which device editing leaves alone. */
function stateEntries<T>(value: Variants<T> | undefined): VariantMap<T> {
  if (!isVariantMap(value)) return {};
  return Object.fromEntries(Object.entries(value).filter(([key, entry]) => !BREAKPOINT_KEYS.has(key) && entry !== undefined)) as VariantMap<T>;
}

/**
 * The stored value for what each device shows. With no overrides it's a plain value; otherwise `base` (phones), `md`
 * (tablets) and `lg` (desktops), leaving out keys that repeat the size below. A device with nothing set takes
 * `fallback`, the value the field shows while unset, since variants can't say "unset from here up".
 */
function compose<T>(desktop: T | undefined, tablet: T | undefined, phone: T | undefined, fallback: T, states: VariantMap<T>): Variants<T> | undefined {
  const hasStates = Object.keys(states).length > 0;
  if (sameContent(desktop, tablet) && sameContent(tablet, phone)) {
    if (!hasStates) return desktop;
    return desktop === undefined ? states : { base: desktop, ...states };
  }
  const d = desktop ?? fallback;
  const t = tablet ?? d;
  const p = phone ?? t;
  const map: VariantMap<T> = { base: p };
  if (!sameContent(t, p)) map.md = t;
  if (!sameContent(d, t)) map.lg = d;
  return { ...map, ...states };
}

/**
 * Sets the value a device shows, or (undefined on Tablet or Phone) removes its override. Setting Desktop also moves
 * the sizes that follow it; an override stays until it's removed.
 */
export function writeAt<T>(value: Variants<T> | undefined, device: EditDevice, next: T | undefined, fallback: T): Variants<T> | undefined {
  const current = deviceValues(value);
  const tabletOwn = isOverridden(value, 'tablet');
  const phoneOwn = isOverridden(value, 'phone');
  let { desktop, tablet, phone } = current;
  if (device === 'desktop') {
    desktop = next;
    if (!tabletOwn) tablet = desktop;
    if (!phoneOwn) phone = tablet;
  } else if (device === 'tablet') {
    tablet = next === undefined ? desktop : next;
    if (!phoneOwn) phone = tablet;
  } else {
    phone = next === undefined ? tablet : next;
  }
  return compose(desktop, tablet, phone, fallback, stateEntries(value));
}

/** The value a state shows (e.g. on hover), if one is set. */
export const readState = <T>(value: Variants<T> | undefined, state: 'hover'): T | undefined => (isVariantMap(value) ? value[state] : undefined);

/** Sets or (undefined) clears the value a state shows, keeping the rest. */
export function writeState<T>(value: Variants<T> | undefined, state: 'hover', next: T | undefined): Variants<T> | undefined {
  const map: VariantMap<T> = isVariantMap(value) ? { ...value } : value === undefined ? {} : { base: value };
  if (next === undefined) delete map[state];
  else map[state] = next;
  const keys = Object.keys(map) as VariantKey[];
  if (keys.length === 0) return undefined;
  return keys.length === 1 && keys[0] === 'base' ? map.base : map;
}
