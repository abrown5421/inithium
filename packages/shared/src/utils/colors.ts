export function hexToRgba(hex: string, alpha: number = 1): string {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split('')
      .map((c) => c + c)
      .join('');
  }

  const num = parseInt(cleanHex, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function rgbaToHex(rgba: string): string {
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (!match) return '#000000';

  const r = parseInt(match[1]).toString(16).padStart(2, '0');
  const g = parseInt(match[2]).toString(16).padStart(2, '0');
  const b = parseInt(match[3]).toString(16).padStart(2, '0');

  return `#${r}${g}${b}`;
}

export function getLightOrDark(hex: string): string {
  const rgba = hexToRgba(hex);
  const [r, g, b] = rgba
    .match(/\d+/g)!
    .map(Number)
    .map((c) => c / 255)
    .map((c) =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );
  if (0.2126 * r + 0.7152 * g + 0.0722 * b < 0.5) {
    return 'dark';
  } else {
    return 'light';
  }
}

export function adjustColor(hex: string, amount: number): string {
  const [r, g, b] = hexToRgba(hex).match(/\d+/g)!.map(Number);

  const clamp = (val: number) => Math.max(0, Math.min(255, val + amount));

  return `rgb(${clamp(r)}, ${clamp(g)}, ${clamp(b)})`;
}

export function lighten(hex: string, amount: number) {
  return adjustColor(hex, amount);
}

export function darken(hex: string, amount: number) {
  return adjustColor(hex, -amount);
}
