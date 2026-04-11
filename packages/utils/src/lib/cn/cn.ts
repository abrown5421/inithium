export const cn = (...inputs: any[]): string => {
  return inputs
    .flat(Infinity)
    .filter(Boolean)
    .join(' ')
    .trim()
    .replace(/\s+/g, ' ');
};