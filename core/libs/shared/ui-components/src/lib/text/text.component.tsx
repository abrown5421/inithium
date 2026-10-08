import type { ElementType, HTMLAttributes, ReactNode, Ref } from 'react';
import { textStylePropsSchema, type TextStyleProps } from '@inithium/shared-contracts';
import { splitStyleProps } from '../style-props/split-style-props.service';
import { resolveTextStyles } from '../style-props/style-props.service';

const styleKeys = new Set(Object.keys(textStylePropsSchema.shape) as (keyof TextStyleProps)[]);

export type TextProps = TextStyleProps &
  Omit<HTMLAttributes<HTMLElement>, 'className' | 'style' | 'color'> & {
    /** For `as="label"`: the id of the input it labels. */
    htmlFor?: string;
    children?: ReactNode;
    ref?: Ref<HTMLElement>;
  };

/** Text: typography, colour and spacing through props. Renders a <p> unless `as` says otherwise. */
export function Text(props: TextProps) {
  const [styleProps, { children, ...rest }] = splitStyleProps(props, styleKeys);
  // The allowed tags are constrained by the prop types; ElementType lets one ref type cover them all.
  const Element = (styleProps.as ?? 'p') as ElementType;
  const { className, style } = resolveTextStyles(styleProps);

  return (
    <Element className={className || undefined} style={style} {...rest}>
      {children}
    </Element>
  );
}
