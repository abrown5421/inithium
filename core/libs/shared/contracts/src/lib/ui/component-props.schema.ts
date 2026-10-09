import { z } from 'zod';
import { animationSchema } from './animation.schema';
import { dividerLabelAlignSchema } from './divider.schema';
import { iconNameSchema } from './icon.schema';
import { inputTypeSchema } from './input.schema';
import { radioOptionSchema } from './radio-group.schema';
import { switchLabelPlacementSchema } from './switch.schema';
import {
  buttonStylePropsSchema,
  checkboxStylePropsSchema,
  containerStylePropsSchema,
  dividerStylePropsSchema,
  iconStylePropsSchema,
  inputStylePropsSchema,
  loaderStylePropsSchema,
  radioGroupStylePropsSchema,
  switchStylePropsSchema,
  textStylePropsSchema,
} from './style-props.schema';

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

export const inputPropsSchema = inputStylePropsSchema
  .extend({
    type: inputTypeSchema.optional(),
    /** Sits in the field and floats above it on focus or once there's a value. */
    label: z.string().min(1).optional(),
    /** Shown while the field is empty and focused (or always, without a label). */
    placeholder: z.string().optional(),
    /** A line of guidance under the field. */
    helperText: z.string().optional(),
    required: z.boolean().optional(),
    /** A decorative Lucide icon before the text. */
    leadingIcon: iconNameSchema.optional(),
    /** A decorative Lucide icon after the text. */
    trailingIcon: iconNameSchema.optional(),
    animation: animationSchema.optional(),
  })
  .strict();

export const checkboxPropsSchema = checkboxStylePropsSchema
  .extend({
    /** Text beside the box; clicking it toggles the box. */
    label: z.string().min(1).optional(),
    /** A line of guidance under the label. */
    helperText: z.string().optional(),
    required: z.boolean().optional(),
    animation: animationSchema.optional(),
  })
  .strict();

export const loaderPropsSchema = loaderStylePropsSchema
  .extend({
    /** What's loading, announced to screen readers. Default 'Loading'. */
    label: z.string().min(1).optional(),
    animation: animationSchema.optional(),
  })
  .strict();

export const switchPropsSchema = switchStylePropsSchema
  .extend({
    /** Text beside the switch; clicking it toggles the switch. */
    label: z.string().min(1).optional(),
    /** Which side the label sits on. Default 'end' (after the switch). */
    labelPlacement: switchLabelPlacementSchema.optional(),
    /** A line of guidance under the label. */
    helperText: z.string().optional(),
    required: z.boolean().optional(),
    /** A Lucide icon on the thumb while on. */
    checkedIcon: iconNameSchema.optional(),
    /** A Lucide icon on the thumb while off. */
    uncheckedIcon: iconNameSchema.optional(),
    animation: animationSchema.optional(),
  })
  .strict();

export const dividerPropsSchema = dividerStylePropsSchema
  .extend({
    /** Text in the line, e.g. 'or'. */
    label: z.string().min(1).optional(),
    /** Where the label sits along the line. Default 'center'. */
    labelAlign: dividerLabelAlignSchema.optional(),
    /** Hides the divider from screen readers, when it's purely visual. */
    decorative: z.boolean().optional(),
    animation: animationSchema.optional(),
  })
  .strict();

export const radioGroupPropsSchema = radioGroupStylePropsSchema
  .extend({
    options: z.array(radioOptionSchema).min(1),
    /** The group's name, shown above the options. */
    label: z.string().min(1).optional(),
    /** A line of guidance under the options. */
    helperText: z.string().optional(),
    required: z.boolean().optional(),
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
