export function luminance(hex: string) {
  const matches = hex.replace('#', '').match(/.{2}/g);
  if (!matches) throw new Error(`Invalid hex color: ${hex}`);

  const rgb = matches.map(c => parseInt(c, 16) / 255);

  const [r, g, b] = rgb.map(c =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(hex1: string, hex2: string) {
  const l1 = luminance(hex1);
  const l2 = luminance(hex2);
  const brightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);
  return (brightest + 0.05) / (darkest + 0.05);
}
