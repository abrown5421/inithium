import { z } from 'zod';
import { animationSchema } from './animation.schema';
import { iconNameSchema } from './icon.schema';
import { buttonStylePropsSchema, containerStylePropsSchema, iconStylePropsSchema, textStylePropsSchema } from './style-props.schema';

// Everything about a component that can be stored (e.g. in a page section): its style props plus its
// animation. Runtime-only props (show, replay, callbacks, children) are not part of these schemas.

export const containerPropsSchema = containerStylePropsSchema
  .extend({
    animation: animationSchema.optional(),
    /** Adds index × ms to each direct child's entrance delay, so children cascade in. */
    stagger: z.number().min(0).optional(),
  })
  .strict();

export const buttonPropsSchema = buttonStylePropsSchema
  .extend({
    /** A Lucide icon shown before the content. */
    leadingIcon: iconNameSchema.optional(),
    /** A Lucide icon shown after the content. */
    trailingIcon: iconNameSchema.optional(),
    animation: animationSchema.optional(),
  })
  .strict();

export const textPropsSchema = textStylePropsSchema.extend({ animation: animationSchema.optional() }).strict();

export const iconPropsSchema = iconStylePropsSchema
  .extend({
    name: iconNameSchema,
    /** Makes the icon meaningful to screen readers; without it the icon is decorative and hidden from them. */
    label: z.string().min(1).optional(),
    animation: animationSchema.optional(),
  })
  .strict();
