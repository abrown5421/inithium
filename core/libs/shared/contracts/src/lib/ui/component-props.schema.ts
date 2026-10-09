import { z } from 'zod';
import { animationSchema } from './animation.schema';
import { autoIncrementingListAlignSchema } from './auto-incrementing-list.schema';
import { colorPickerPaletteSchema } from './color-picker.schema';
import { colorValueSchema, solidColorValueSchema } from './colors.schema';
import { dividerLabelAlignSchema } from './divider.schema';
import { iconNameSchema } from './icon.schema';
import { inputTypeSchema } from './input.schema';
import { radioOptionSchema } from './radio-group.schema';
import { selectOptionsSchema } from './select.schema';
import { sliderMarksSchema, sliderValueLabelSchema } from './slider.schema';
import { switchLabelPlacementSchema } from './switch.schema';
import { tabItemSchema } from './tabs.schema';
import { tooltipAlignSchema, tooltipSideSchema } from './tooltip.schema';
import {
  buttonStylePropsSchema,
  checkboxStylePropsSchema,
  containerStylePropsSchema,
  dividerStylePropsSchema,
  iconStylePropsSchema,
  inputStylePropsSchema,
  loaderStylePropsSchema,
  radioGroupStylePropsSchema,
  sharedStylePropsSchema,
  sliderStylePropsSchema,
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

/** A Select's field shares Input's style props: variant, colour, spacing and width (decision 0062). */
export const selectPropsSchema = inputStylePropsSchema
  .extend({
    options: selectOptionsSchema,
    /** Sits in the field and floats above it on focus, while open, or once there's a value. */
    label: z.string().min(1).optional(),
    /** Shown while nothing is chosen and the label has floated (or always, without a label). */
    placeholder: z.string().optional(),
    /** A line of guidance under the field. */
    helperText: z.string().optional(),
    required: z.boolean().optional(),
    /** A decorative Lucide icon before the value. */
    leadingIcon: iconNameSchema.optional(),
    animation: animationSchema.optional(),
  })
  .strict();

export const sliderPropsSchema = sliderStylePropsSchema
  .extend({
    /** Default 0. */
    min: z.number().optional(),
    /** Default 100. */
    max: z.number().optional(),
    /** Default 1. */
    step: z.number().positive().optional(),
    /** For a range: how many steps apart the two thumbs must stay. Default 0. */
    minStepsBetweenThumbs: z.number().min(0).optional(),
    marks: sliderMarksSchema.optional(),
    /** When the value shows above the thumb. Default 'auto' (while hovered, focused or dragged). */
    valueLabel: sliderValueLabelSchema.optional(),
    /** The slider's name, shown above it with the current value. */
    label: z.string().min(1).optional(),
    /** A line of guidance under the slider. */
    helperText: z.string().optional(),
    /** Marks the label with an asterisk. A slider always has a value. */
    required: z.boolean().optional(),
    animation: animationSchema.optional(),
  })
  .strict();

/**
 * A Tooltip's storable props (decision 0064). It wraps an element rather than rendering one, so it has no style
 * props or animation of its own.
 */
export const tooltipPropsSchema = z
  .object({
    /** The text shown. */
    content: z.string().min(1),
    /** Default 'top'. */
    side: tooltipSideSchema.optional(),
    /** Default 'center'. */
    align: tooltipAlignSchema.optional(),
    /** The bubble's colour; its text is the colour's 100 step. Default surface 900. */
    color: solidColorValueSchema.optional(),
    /** How long to hover before it opens, in ms. Default 500. */
    delay: z.number().min(0).optional(),
    /** Whether a small arrow points at the element. Default true. */
    arrow: z.boolean().optional(),
  })
  .strict();

/**
 * A Modal's storable props (decision 0065): its title and description, how it closes, the overlay colour, the
 * panel's animation, and the panel's Container style props. Its content (children) isn't stored here.
 */
export const modalPropsSchema = containerStylePropsSchema
  .omit({ as: true })
  .extend({
    /** The modal's heading; also its name for screen readers. */
    title: z.string().min(1),
    /** A line under the title, read with it by screen readers. */
    description: z.string().optional(),
    /** Keeps the title for screen readers only. Default false. */
    hideTitle: z.boolean().optional(),
    /** Whether the overlay click and Escape close it. Default true. */
    dismissible: z.boolean().optional(),
    /** Whether an ✕ button shows in the top-right corner. Default true. */
    closeButton: z.boolean().optional(),
    /** The overlay behind the panel. Default neutral 950 at 60%, dark in both modes. */
    overlayColor: colorValueSchema.optional(),
    /** The panel's entrance and exit. Default fadeInUp and fadeOutDown. */
    animation: animationSchema.optional(),
  })
  .strict();

/** Tabs' storable props (decision 0068): the tabs (without their content), colour, fill, spacing and animation. */
export const tabsPropsSchema = sharedStylePropsSchema
  .pick({ margin: true, padding: true })
  .extend({
    tabs: z.array(tabItemSchema).min(1),
    /** The active tab's underline and the focus outline. Default 'primary' (500). */
    color: solidColorValueSchema.optional(),
    /** Stretches the tabs to share the bar's width equally. Default false. */
    fill: z.boolean().optional(),
    animation: animationSchema.optional(),
  })
  .strict();

/** A ColorPicker's storable props (decision 0069): its field (Input's style props), label, placeholder, palette. */
export const colorPickerPropsSchema = inputStylePropsSchema
  .extend({
    /** Sits in the field and floats above it once a colour is chosen or the panel is open. */
    label: z.string().min(1).optional(),
    /** Shown while no colour is chosen. */
    placeholder: z.string().optional(),
    /** A line of guidance under the field. */
    helperText: z.string().optional(),
    required: z.boolean().optional(),
    /** 'all' (default): theme tokens and Tailwind colours, in two tabs. 'theme': theme tokens only. */
    palette: colorPickerPaletteSchema.optional(),
    animation: animationSchema.optional(),
  })
  .strict();

/**
 * An AutoIncrementingList's storable props (decision 0070): its label, limits, button colours and wording,
 * alignment, spacing and animation. Its items and how they render are runtime only.
 */
export const autoIncrementingListPropsSchema = sharedStylePropsSchema
  .pick({ margin: true, padding: true })
  .extend({
    /** A name shown above the list, e.g. 'X colours'. */
    label: z.string().min(1).optional(),
    /** A line of guidance under the list. */
    helperText: z.string().optional(),
    /** The fewest rows; minus buttons hide at this count. Default 1. */
    min: z.number().int().min(1).optional(),
    /** The most rows; the plus button hides at this count. */
    max: z.number().int().min(1).optional(),
    /** The plus button. Default 'primary'. */
    addColor: solidColorValueSchema.optional(),
    /** The minus buttons. Default 'red'. */
    removeColor: solidColorValueSchema.optional(),
    /** What a row is called in button labels: 'Add colour', 'Remove colour 2'. Default 'item'. */
    itemLabel: z.string().min(1).optional(),
    /** Lines the buttons up with the bottom of each row (default) or its middle. */
    align: autoIncrementingListAlignSchema.optional(),
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
