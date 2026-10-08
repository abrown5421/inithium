// Theme scale generation (decisions 0031 and 0041).
// Colours are converted to OKLCH, where equal lightness steps look equal, then back to sRGB hex.

export const scaleSteps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
export type ScaleStep = (typeof scaleSteps)[number];
export type ColorScale = Record<ScaleStep, string>;

interface Oklch {
  l: number;
  c: number;
  h: number;
}

/** WCAG AA for body text, plus a small margin so rounding to hex can't drop below it. */
const MIN_TEXT_CONTRAST = 4.6;

// Brand scales run from about Tailwind's lightest 50s to its darkest 950s.
const BRAND_LIGHTEST = 0.975;
const BRAND_DARKEST = 0.27;

// Surface: how far the background band (100 → 400) spreads, and the darkest text step.
const SURFACE_BACKGROUND_SPREAD = 0.2;
const SURFACE_DARKEST = 0.2;

// --- colour space conversion (Björn Ottosson's OKLab) ---

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const fromLinear = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

function hexToLinearRgb(hex: string): [number, number, number] {
  const value = parseInt(hex.slice(1), 16);
  return [toLinear(((value >> 16) & 255) / 255), toLinear(((value >> 8) & 255) / 255), toLinear((value & 255) / 255)];
}

function linearRgbToHex([r, g, b]: [number, number, number]): string {
  const channel = (c: number) =>
    Math.round(Math.min(1, Math.max(0, fromLinear(c))) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${channel(r)}${channel(g)}${channel(b)}`;
}

function linearRgbToOklch([r, g, b]: [number, number, number]): Oklch {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return { l: L, c: Math.hypot(a, bb), h: (Math.atan2(bb, a) * 180) / Math.PI };
}

function oklchToLinearRgb({ l: L, c, h }: Oklch): [number, number, number] {
  const a = c * Math.cos((h * Math.PI) / 180);
  const b = c * Math.sin((h * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

const inGamut = (rgb: [number, number, number]) => rgb.every((c) => c >= -1e-6 && c <= 1 + 1e-6);

/** Converts to sRGB hex, reducing chroma (keeping lightness and hue) until the colour fits sRGB. */
function oklchToHex(color: Oklch): string {
  if (inGamut(oklchToLinearRgb(color))) return linearRgbToHex(oklchToLinearRgb(color));
  let low = 0;
  let high = color.c;
  for (let i = 0; i < 24; i++) {
    const mid = (low + high) / 2;
    if (inGamut(oklchToLinearRgb({ ...color, c: mid }))) low = mid;
    else high = mid;
  }
  return linearRgbToHex(oklchToLinearRgb({ ...color, c: low }));
}

export function hexToOklch(hex: string): Oklch {
  return linearRgbToOklch(hexToLinearRgb(hex));
}

/** WCAG 2 contrast ratio between two hex colours (1–21). */
export function contrastRatio(first: string, second: string): number {
  const luminance = (hex: string) => {
    const [r, g, b] = hexToLinearRgb(hex);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [lighter, darker] = [luminance(first), luminance(second)].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
}

const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

// --- brand scales ---

/** A brand token's scale. The chosen colour is exactly 500; lighter steps lose chroma toward 50. */
export function generateBrandScale(hex500: string): ColorScale {
  const base = hexToOklch(hex500);
  const lightest = Math.max(BRAND_LIGHTEST, base.l + (1 - base.l) * 0.5);
  const darkest = Math.min(BRAND_DARKEST, base.l * 0.5);

  const lighter = [400, 300, 200, 100, 50] as const;
  const darker = [600, 700, 800, 900, 950] as const;
  const scale = { 500: hex500.toLowerCase() } as ColorScale;

  lighter.forEach((step, i) => {
    const t = (i + 1) / lighter.length;
    scale[step] = oklchToHex({ l: lerp(base.l, lightest, t), c: base.c * (1 - 0.7 * t ** 1.5), h: base.h });
  });
  darker.forEach((step, i) => {
    const t = (i + 1) / darker.length;
    scale[step] = oklchToHex({ l: lerp(base.l, darkest, t), c: base.c * (1 - 0.3 * t), h: base.h });
  });
  return scale;
}

// --- surface scale ---

// Surface text gains a little chroma as it darkens, so tinted surfaces get matching text.
const SURFACE_CHROMA: Record<ScaleStep, number> = {
  50: 0.5, 100: 1, 200: 1.5, 300: 2, 400: 3, 500: 4, 600: 6, 700: 7, 800: 8, 900: 9, 950: 10,
};

function surfaceColor(base: Oklch, step: ScaleStep, l: number): string {
  return oklchToHex({ l, c: Math.min(base.c * SURFACE_CHROMA[step], 0.06), h: base.h });
}

/**
 * The surface scale. The chosen colour is exactly 100. Steps 50–400 are the background band and 600–950 the
 * text band; every text step meets WCAG AA (4.5:1) against every background step. 500 is the midpoint.
 * Throws if the colour is too dark for any text band to contrast with it.
 */
export function generateSurfaceScale(hex100: string): ColorScale {
  const base = hexToOklch(hex100);

  // Narrow the background band until a text band can contrast with its darkest step.
  for (let spread = SURFACE_BACKGROUND_SPREAD; spread >= 0; spread -= 0.02) {
    const l400 = Math.max(0, base.l - spread);
    const bg400 = surfaceColor(base, 400, l400);

    // The lightest text step (600) that still meets the contrast target against 400.
    let low = 0;
    let high = l400;
    if (contrastRatio(surfaceColor(base, 600, low), bg400) < MIN_TEXT_CONTRAST) continue;
    for (let i = 0; i < 30; i++) {
      const mid = (low + high) / 2;
      if (contrastRatio(surfaceColor(base, 600, mid), bg400) >= MIN_TEXT_CONTRAST) low = mid;
      else high = mid;
    }
    const l600 = low;
    const l950 = Math.min(SURFACE_DARKEST, l600 * 0.6);

    return {
      50: surfaceColor(base, 50, lerp(base.l, 1, 0.6)),
      100: hex100.toLowerCase(),
      200: surfaceColor(base, 200, lerp(base.l, l400, 1 / 3)),
      300: surfaceColor(base, 300, lerp(base.l, l400, 2 / 3)),
      400: bg400,
      500: surfaceColor(base, 500, (l400 + l600) / 2),
      600: surfaceColor(base, 600, l600),
      700: surfaceColor(base, 700, lerp(l600, l950, 1 / 4)),
      800: surfaceColor(base, 800, lerp(l600, l950, 2 / 4)),
      900: surfaceColor(base, 900, lerp(l600, l950, 3 / 4)),
      950: surfaceColor(base, 950, l950),
    };
  }

  throw new Error(`Surface colour ${hex100} is too dark: no text colour can meet WCAG AA contrast against it.`);
}
