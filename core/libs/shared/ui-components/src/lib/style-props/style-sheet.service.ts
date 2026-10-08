import { breakpoints, states, type State, type VariantKey } from '@inithium/shared-contracts';
import { breakpointMinWidths, nonInheritedProperties, styleProperties, type StyleProperty } from './style-properties.config';

const stateSelectors: Record<State, string> = {
  hover: ':hover',
  focus: ':focus-visible',
  active: ':active',
  disabled: ':disabled',
};

/** '' for base, otherwise '-md', '-hover' or '-md-hover'. */
export function variantSuffix(key: VariantKey): string {
  return key === 'base' ? '' : `-${key.replace(':', '-')}`;
}

export function styleClassName(property: StyleProperty, key: VariantKey): string {
  return `ui-${property}${variantSuffix(key)}`;
}

/** The CSS variable feeding one CSS property of a style property at a variant key. */
export function styleVariableName(property: StyleProperty, index: number, key: VariantKey): string {
  const part = styleProperties[property].length > 1 ? `-${index}` : '';
  return `--ui-${property}${part}${variantSuffix(key)}`;
}

function rulesFor(key: VariantKey, state?: State): string {
  return (Object.keys(styleProperties) as StyleProperty[])
    .map((property) => {
      const declarations = styleProperties[property]
        .map((css, index) => `${css}:var(${styleVariableName(property, index, key)})`)
        .join(';');
      return `.${styleClassName(property, key)}${state ? stateSelectors[state] : ''}{${declarations}}`;
    })
    .join('');
}

/** Base rules, then each state; hover only applies on devices that can hover (as in Tailwind). */
function blockFor(breakpoint?: (typeof breakpoints)[number]): string {
  const prefix = breakpoint ? `${breakpoint}:` : '';
  const plain = rulesFor((breakpoint ?? 'base') as VariantKey);
  const stateful = states
    .map((state) => {
      const rules = rulesFor(`${prefix}${state}` as VariantKey, state);
      return state === 'hover' ? `@media (hover:hover){${rules}}` : rules;
    })
    .join('');
  return plain + stateful;
}

/**
 * The stylesheet behind every style prop: one rule per style property per variant key, smallest breakpoint
 * first so larger ones win. Built once and published by <UiProvider />.
 */
export function buildStyleSheet(): string {
  const registrations = nonInheritedProperties.map((name) => `@property ${name}{syntax:'*';inherits:false}`).join('');
  const responsive = breakpoints
    .map((breakpoint) => `@media (width >= ${breakpointMinWidths[breakpoint]}){${blockFor(breakpoint)}}`)
    .join('');
  return registrations + blockFor() + responsive;
}
