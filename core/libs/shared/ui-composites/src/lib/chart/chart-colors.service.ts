import type { ColorValue } from '@inithium/shared-contracts';
import { toCssColor } from '@inithium/shared-ui-components';

/** A colour as Chart.js can take it: red, green, blue 0–255 and alpha 0–1. */
export type Rgba = [number, number, number, number];

export const rgbaCss = ([r, g, b, a]: Rgba, alpha = a) => `rgba(${r}, ${g}, ${b}, ${alpha})`;

/**
 * Reads colour values as RGBA where `host` sits in the page (decision 0120). Chart.js draws on a canvas, which can't
 * read the theme's CSS variables, so each colour is resolved by the browser (a probe element's computed colour, which
 * follows the theme and dark mode) and then drawn on a 1px canvas to get plain RGBA, which every browser's canvas and
 * Chart.js's own colour helpers understand.
 */
export function readColors<K extends string>(host: HTMLElement, colors: Record<K, ColorValue>): Record<K, Rgba> {
  const doc = host.ownerDocument;
  const probe = doc.createElement('span');
  probe.style.display = 'none';
  host.appendChild(probe);
  const canvas = doc.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext('2d', { willReadFrequently: true });

  const read = (value: ColorValue): Rgba => {
    probe.style.color = toCssColor(value);
    const css = doc.defaultView?.getComputedStyle(probe).color ?? '';
    if (!context || !css) return [0, 0, 0, 1];
    context.clearRect(0, 0, 1, 1);
    context.fillStyle = css;
    context.fillRect(0, 0, 1, 1);
    const [r = 0, g = 0, b = 0, a = 255] = context.getImageData(0, 0, 1, 1).data;
    return [r, g, b, Math.round((a / 255) * 100) / 100];
  };

  const result = Object.fromEntries(Object.entries<ColorValue>(colors).map(([key, value]) => [key, read(value)])) as Record<K, Rgba>;
  probe.remove();
  return result;
}

/** The body font's family, for the chart's labels. */
export function bodyFontFamily(host: HTMLElement): string {
  const value = host.ownerDocument.defaultView?.getComputedStyle(host).getPropertyValue('--font-body').trim();
  return value || 'sans-serif';
}
