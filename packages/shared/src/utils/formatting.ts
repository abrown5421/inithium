export type CaseType =
  | 'camel'
  | 'pascal'
  | 'snake'
  | 'kebab'
  | 'sentence'
  | 'upper'
  | 'lower';

export function formatDate(iso: string, locale = 'en-US'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(iso));
}

export function truncate(str: string, maxLen: number): string {
  return str.length <= maxLen ? str : str.slice(0, maxLen - 3) + '...';
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function caseConverter(value: string, caseType: CaseType): string {
  const words = value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_\-]+/g, ' ')
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  switch (caseType) {
    case 'camel':
      return words
        .map((w, i) => (i === 0 ? w : w[0].toUpperCase() + w.slice(1)))
        .join('');
    case 'pascal':
      return words.map((w) => w[0].toUpperCase() + w.slice(1)).join('');
    case 'snake':
      return words.join('_');
    case 'kebab':
      return words.join('-');
    case 'sentence':
      return words.length
        ? words[0][0].toUpperCase() +
            words[0].slice(1) +
            ' ' +
            words.slice(1).join(' ')
        : '';
    case 'upper':
      return value.toUpperCase();
    case 'lower':
      return value.toLowerCase();
    default:
      return value;
  }
}
