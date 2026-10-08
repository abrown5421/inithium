import type { z } from 'zod';
import type { containerPropsSchema, textPropsSchema } from './component-props.schema';

/** A Container's storable props: style props, animation and stagger. */
export type ContainerSerializableProps = z.infer<typeof containerPropsSchema>;

/** A Text's storable props: style props and animation. */
export type TextSerializableProps = z.infer<typeof textPropsSchema>;
