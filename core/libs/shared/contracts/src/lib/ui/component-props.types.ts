import type { z } from 'zod';
import type { buttonPropsSchema, containerPropsSchema, iconPropsSchema, textPropsSchema } from './component-props.schema';

/** A Button's storable props: variant, colours, spacing, width, icons and animation. */
export type ButtonSerializableProps = z.infer<typeof buttonPropsSchema>;

/** A Container's storable props: style props, animation and stagger. */
export type ContainerSerializableProps = z.infer<typeof containerPropsSchema>;

/** A Text's storable props: style props and animation. */
export type TextSerializableProps = z.infer<typeof textPropsSchema>;

/** An Icon's storable props: name, label, style props and animation. */
export type IconSerializableProps = z.infer<typeof iconPropsSchema>;
