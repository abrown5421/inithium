import { z } from 'zod';
import { animationSchema } from './animation.schema';
import { containerStylePropsSchema, textStylePropsSchema } from './style-props.schema';

// Everything about a component that can be stored (e.g. in a page section): its style props plus its
// animation. Runtime-only props (show, replay, callbacks, children) are not part of these schemas.

export const containerPropsSchema = containerStylePropsSchema
  .extend({
    animation: animationSchema.optional(),
    /** Adds index × ms to each direct child's entrance delay, so children cascade in. */
    stagger: z.number().min(0).optional(),
  })
  .strict();

export const textPropsSchema = textStylePropsSchema.extend({ animation: animationSchema.optional() }).strict();
