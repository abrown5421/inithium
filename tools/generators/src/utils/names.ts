export const toKebab = (name: string): string =>
  name
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();

export const toCamel = (name: string): string =>
  toKebab(name).replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());

export const toPascal = (name: string): string => {
  const camel = toCamel(name);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
};

export const toSingular = (name: string): string => {
  const kebab = toKebab(name);
  if (kebab.endsWith('ies')) return kebab.slice(0, -3) + 'y';
  if (kebab.endsWith('s') && !kebab.endsWith('ss')) return kebab.slice(0, -1);
  return kebab;
};

export interface CollectionNames {
  kebab: string;
  singular: string;
  pascal: string;
  singularPascal: string;
  camel: string;
  singularCamel: string;
}

export const deriveNames = (name: string): CollectionNames => {
  const kebab = toKebab(name);
  const singular = toSingular(kebab);
  const pascal = toPascal(kebab);
  const singularPascal = toPascal(singular);
  const camel = toCamel(kebab);
  const singularCamel = toCamel(singular);
  return { kebab, singular, pascal, singularPascal, camel, singularCamel };
};
