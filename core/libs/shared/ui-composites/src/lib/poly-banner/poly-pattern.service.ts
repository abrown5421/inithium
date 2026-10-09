import type { PolyPattern, PolyPatternColor } from '@inithium/shared-contracts';
import { toCssColor } from '@inithium/shared-ui-components';

type Point = readonly [number, number];

/** One triangle: its corners as an SVG points list, and its centre. */
export type PolyTriangle = { points: string; cx: number; cy: number };

/** The recipe a new banner starts from, apart from its seed (decision 0074). */
export const DEFAULT_POLY_PATTERN: Omit<PolyPattern, 'seed'> = {
  cellSize: 75,
  variance: 0.75,
  xColors: [
    { color: 'primary', intensity: 200 },
    { color: 'primary', intensity: 500 },
    { color: 'primary', intensity: 800 },
  ],
};

/** A fresh random seed, e.g. 'k3x9q1za'. */
export const createPolySeed = () => Math.random().toString(36).slice(2, 10).padEnd(8, '0');

/** A new recipe: the defaults with a fresh seed. */
export const createPolyPattern = (): PolyPattern => ({ ...DEFAULT_POLY_PATTERN, seed: createPolySeed() });

/** FNV-1a: a seed string as a 32-bit number. */
function hashSeed(seed: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < seed.length; index++) {
    hash = Math.imul(hash ^ seed.charCodeAt(index), 0x01000193);
  }
  return hash >>> 0;
}

/**
 * A repeatable random number in [0, 1) for one grid point (i, j) and purpose k. Each point has its own number, not
 * a place in a sequence, so a wider banner adds points without moving the ones already drawn.
 */
function random(seed: number, i: number, j: number, k: number): number {
  let hash = seed ^ Math.imul(i, 0x27d4eb2d) ^ Math.imul(j, 0x165667b1) ^ Math.imul(k + 1, 0x9e3779b9);
  hash = Math.imul(hash ^ (hash >>> 16), 0x85ebca6b);
  hash = Math.imul(hash ^ (hash >>> 13), 0xc2b2ae35);
  hash ^= hash >>> 16;
  return (hash >>> 0) / 4294967296;
}

/** Which side of the line a→b the point p is on: positive one way, negative the other, 0 on it. */
const side = (a: Point, b: Point, p: Point) => (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);

/** Whether d is inside the circle through a, b and c (whichever way round they go). */
function inCircle(a: Point, b: Point, c: Point, d: Point): number {
  const [ax, ay] = [a[0] - d[0], a[1] - d[1]];
  const [bx, by] = [b[0] - d[0], b[1] - d[1]];
  const [cx, cy] = [c[0] - d[0], c[1] - d[1]];
  const det =
    (ax * ax + ay * ay) * (bx * cy - cx * by) -
    (bx * bx + by * by) * (ax * cy - cx * ay) +
    (cx * cx + cy * cy) * (ax * by - bx * ay);
  return det * Math.sign(side(a, b, c));
}

/**
 * Splits a width × height area into triangles (decision 0074): a grid of `cellSize` cells, one cell past each
 * edge, whose points each wander up to half a cell × `variance`. Each cell becomes two triangles along whichever
 * diagonal stays inside it, preferring the one a Delaunay triangulation would pick, and a coin toss on a tie.
 */
export function polyTriangles(
  width: number,
  height: number,
  { cellSize, variance, seed }: Pick<PolyPattern, 'cellSize' | 'variance' | 'seed'>,
): PolyTriangle[] {
  const hashed = hashSeed(seed);
  const columns = Math.ceil(width / cellSize) + 1;
  const rows = Math.ceil(height / cellSize) + 1;
  const point = (i: number, j: number): Point => [
    i * cellSize + (random(hashed, i, j, 0) - 0.5) * variance * cellSize,
    j * cellSize + (random(hashed, i, j, 1) - 0.5) * variance * cellSize,
  ];
  const tie = cellSize ** 4 * 1e-9;

  const triangles: PolyTriangle[] = [];
  const add = (...corners: Point[]) =>
    triangles.push({
      points: corners.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' '),
      cx: (corners[0][0] + corners[1][0] + corners[2][0]) / 3,
      cy: (corners[0][1] + corners[1][1] + corners[2][1]) / 3,
    });

  for (let j = -1; j < rows; j++) {
    for (let i = -1; i < columns; i++) {
      // The cell's corners, clockwise from top left.
      const a = point(i, j);
      const b = point(i + 1, j);
      const c = point(i + 1, j + 1);
      const d = point(i, j + 1);
      const acInside = Math.sign(side(a, c, b)) !== Math.sign(side(a, c, d));
      const bdInside = Math.sign(side(b, d, a)) !== Math.sign(side(b, d, c));
      let useAc = acInside;
      if (acInside && bdInside) {
        const circle = inCircle(a, b, c, d);
        useAc = Math.abs(circle) <= tie ? random(hashed, i, j, 2) < 0.5 : circle < 0;
      }
      if (useAc) {
        add(a, b, c);
        add(a, c, d);
      } else {
        add(a, b, d);
        add(b, c, d);
      }
    }
  }
  return triangles;
}

const percent = (value: number) => `${Math.round(value * 1000) / 10}%`;

/** The CSS colour at t (0–1) along a gradient of stops, mixed in the browser so theme colours stay live. */
function gradientAt(stops: string[], t: number): string {
  if (stops.length === 1) return stops[0];
  const position = Math.min(Math.max(t, 0), 1) * (stops.length - 1);
  const index = Math.min(Math.floor(position), stops.length - 2);
  const fraction = position - index;
  if (fraction < 0.001) return stops[index];
  if (fraction > 0.999) return stops[index + 1];
  return `color-mix(in oklab, ${stops[index]} ${percent(1 - fraction)}, ${stops[index + 1]})`;
}

/**
 * Each triangle's fill: the colour at its centre along the x gradient (left to right) mixed half and half with
 * the colour along the y gradient (top to bottom). Colours are CSS, so a re-brand or dark mode recolours them.
 */
export function polyFills(
  triangles: PolyTriangle[],
  width: number,
  height: number,
  xColors: PolyPatternColor[],
  yColors: PolyPatternColor[] = xColors,
): string[] {
  const xStops = xColors.map(toCssColor);
  const yStops = yColors.map(toCssColor);
  return triangles.map(({ cx, cy }) => {
    const x = gradientAt(xStops, cx / width);
    const y = gradientAt(yStops, cy / height);
    return x === y ? x : `color-mix(in oklab, ${x} 50%, ${y})`;
  });
}
