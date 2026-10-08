import type { z } from 'zod';
import type { buttonPropsSchema, containerPropsSchema, iconPropsSchema, inputPropsSchema, textPropsSchema } from './component-props.schema';

/** A Button's storable props: variant, colours, spacing, width, icons and animation. */
export type ButtonSerializableProps = z.infer<typeof buttonPropsSchema>;

/** An Input's storable props: variant, colour, type, label, placeholder, helper text, icons, spacing and animation. */
export type InputSerializableProps = z.infer<typeof inputPropsSchema>;

/** A Container's storable props: style props, animation and stagger. */
export type ContainerSerializableProps = z.infer<typeof containerPropsSchema>;

/** A Text's storable props: style props and animation. */
export type TextSerializableProps = z.infer<typeof textPropsSchema>;

/** An Icon's storable props: name, label, style props and animation. */
export type IconSerializableProps = z.infer<typeof iconPropsSchema>;
