import { Avatar as DiceBearAvatar, Style, type StyleDefinition, type StyleOptions } from '@dicebear/core';
import type { AvatarRecipe, AvatarStyle, ColorValue, PolyPatternColor } from '@inithium/shared-contracts';

/** A style's licence, from its definition's `meta` block. */
export type AvatarStyleLicense = { name: string; url?: string; text?: string };
type LoadedStyle = { style: Style; license?: AvatarStyleLicense };
type Definition = { default: unknown };

// Each definition is its own chunk, loaded the first time its style is drawn (decision 0075).
const definitions: Record<AvatarStyle, () => Promise<Definition>> = {
  initials: () => import('@dicebear/styles/initials.json'),
  blobs: () => import('@dicebear/styles/blobs.json'),
  bottts: () => import('@dicebear/styles/bottts.json'),
  cameo: () => import('@dicebear/styles/cameo.json'),
  disco: () => import('@dicebear/styles/disco.json'),
  gaze: () => import('@dicebear/styles/gaze.json'),
  glass: () => import('@dicebear/styles/glass.json'),
  glyphs: () => import('@dicebear/styles/glyphs.json'),
  landscape: () => import('@dicebear/styles/landscape.json'),
  loops: () => import('@dicebear/styles/loops.json'),
  moods: () => import('@dicebear/styles/moods.json'),
  patchwork: () => import('@dicebear/styles/patchwork.json'),
  planets: () => import('@dicebear/styles/planets.json'),
  rings: () => import('@dicebear/styles/rings.json'),
};

const loading = new Map<AvatarStyle, Promise<LoadedStyle>>();
const loaded = new Map<AvatarStyle, LoadedStyle>();

/** A style, if its definition has already loaded. */
export const loadedAvatarStyle = (name: AvatarStyle) => loaded.get(name);

/** Loads a style's definition once; later calls share the same promise. */
export function loadAvatarStyle(name: AvatarStyle): Promise<LoadedStyle> {
  let promise = loading.get(name);
  if (!promise) {
    promise = definitions[name]().then(({ default: definition }) => {
      const entry: LoadedStyle = {
        style: new Style(definition as StyleDefinition),
        license: (definition as { meta?: { license?: AvatarStyleLicense } }).meta?.license,
      };
      loaded.set(name, entry);
      return entry;
    });
    // A failed load (e.g. offline) can be tried again next time.
    promise.catch(() => loading.delete(name));
    loading.set(name, promise);
  }
  return promise;
}

/** 'landscape' → 'Landscape'. */
export const avatarStyleName = (name: AvatarStyle) => name[0].toUpperCase() + name.slice(1);

/** A fresh random seed, e.g. 'k3x9q1za'. */
export const createAvatarSeed = () => Math.random().toString(36).slice(2, 10).padEnd(8, '0');

/** A new recipe: the initials style with a fresh seed. */
export const createAvatarRecipe = (): AvatarRecipe => ({ style: 'initials', seed: createAvatarSeed() });

/** The text the initials style takes its letters from: the name, or the seed without one. */
const initialsSource = (recipe: AvatarRecipe, name?: string) => name?.trim() || recipe.seed;

/**
 * Draws a recipe as an SVG string. DiceBear escapes everything it writes, including the name's initials, so the
 * string is safe to insert. Its own background is dropped when the circle draws one instead.
 */
export function renderAvatar(style: Style, recipe: AvatarRecipe, name?: string): string {
  const options: StyleOptions = {
    seed: recipe.style === 'initials' ? initialsSource(recipe, name) : recipe.seed,
    flip: recipe.flip ?? 'none',
    rotate: recipe.rotate ?? 0,
    scale: (recipe.scale ?? 100) / 100,
    ...(recipe.style === 'initials' || recipe.backgroundColor !== undefined ? { backgroundColor: [] } : {}),
  };
  return new DiceBearAvatar(style, options).toString();
}

// Initials sit on a colour picked from the seed, so the editor's arrows change the colour, not the letters.
const INITIALS_COLORS: PolyPatternColor['color'][] = [
  'primary', 'secondary', 'tertiary', 'quaternary', 'accent', 'red', 'orange', 'amber', 'emerald', 'teal', 'sky',
  'indigo', 'violet', 'pink',
];

/** FNV-1a: a seed string as a 32-bit number. */
function hashSeed(seed: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < seed.length; index++) hash = Math.imul(hash ^ seed.charCodeAt(index), 0x01000193);
  return hash >>> 0;
}

/** The circle's colour: the recipe's, a colour from the seed for initials, or surface 200 under other styles. */
export function avatarBackground(recipe: AvatarRecipe): ColorValue {
  if (recipe.backgroundColor) return recipe.backgroundColor;
  if (recipe.style === 'initials') return { color: INITIALS_COLORS[hashSeed(recipe.seed) % INITIALS_COLORS.length], intensity: 600 };
  return { color: 'surface', intensity: 200 };
}
