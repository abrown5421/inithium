/** Separates style props (by schema key) from the remaining HTML/React props. */
export function splitStyleProps<P extends object, K extends string>(
  props: P,
  styleKeys: ReadonlySet<K>,
): [Pick<P, Extract<keyof P, K>>, Omit<P, K>] {
  const style: Record<string, unknown> = {};
  const rest: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    (styleKeys.has(key as K) ? style : rest)[key] = value;
  }
  return [style as Pick<P, Extract<keyof P, K>>, rest as Omit<P, K>];
}
