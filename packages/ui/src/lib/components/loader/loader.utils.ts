export function resolveColor(color: string): string {
  const raw = color.trim();
 
  if (
    raw.startsWith('#') ||
    raw.startsWith('rgb') ||
    raw.startsWith('hsl') ||
    raw.includes(' ')
  ) {
    return raw;
  }
 
  return `var(--color-${raw})`;
}
 