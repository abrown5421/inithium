import type { ElementType, HTMLAttributes, ReactNode, Ref } from 'react';
import { containerStylePropsSchema, type ContainerStyleProps } from '@inithium/shared-contracts';
import { splitStyleProps } from '../style-props/split-style-props.service';
import { resolveContainerStyles } from '../style-props/style-props.service';

const styleKeys = new Set(Object.keys(containerStylePropsSchema.shape) as (keyof ContainerStyleProps)[]);

export type ContainerProps = ContainerStyleProps &
  Omit<HTMLAttributes<HTMLElement>, 'className' | 'style' | 'hidden' | 'color'> & {
    children?: ReactNode;
    ref?: Ref<HTMLElement>;
  };

/** A box: layout (flex, grid, position, overflow), spacing, sizing, colour and borders, all through props. */
export function Container(props: ContainerProps) {
  const [styleProps, { children, ...rest }] = splitStyleProps(props, styleKeys);
  // The allowed tags are constrained by the prop types; ElementType lets one ref type cover them all.
  const Element = (styleProps.as ?? 'div') as ElementType;
  const { className, style } = resolveContainerStyles(styleProps);

  return (
    <Element className={className || undefined} style={style} {...rest}>
      {children}
    </Element>
  );
}
