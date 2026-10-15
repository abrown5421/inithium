/** An element's props without the ones its box takes (margin, hiding, entrance), to hand the rest to its component. */
export function withoutBoxProps<Props extends { hidden?: unknown; margin?: unknown; animation?: unknown }>(props: Props): Omit<Props, 'hidden' | 'margin' | 'animation'> {
  const rest = { ...props };
  delete rest.hidden;
  delete rest.margin;
  delete rest.animation;
  return rest;
}
