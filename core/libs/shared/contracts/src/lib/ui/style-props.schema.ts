import { z } from 'zod';
import { borderStyleSchema, borderWidthSchema, radiusSchema, shadowSizeSchema } from './borders.schema';
import { buttonVariantSchema } from './button.schema';
import { colorValueSchema, solidColorValueSchema } from './colors.schema';
import { containerElementSchema, textElementSchema } from './elements.schema';
import { inputVariantSchema } from './input.schema';
import { flexItemSchema, flexSchema, gridItemSchema, gridSchema, overflowSchema, positionSchema } from './layout.schema';
import { sizeValueSchema } from './sizing.schema';
import { marginSchema, paddingSchema } from './spacing.schema';
import { fontFamilySchema, fontWeightSchema, textAlignSchema, truncateSchema } from './typography.schema';
import { withVariants } from './variants.schema';

/** Style props every component shares. Each takes a value or a variant object (decision 0036). */
export const sharedStylePropsSchema = z.object({
  bgColor: withVariants(colorValueSchema).optional(),
  textColor: withVariants(colorValueSchema).optional(),
  borderColor: withVariants(colorValueSchema).optional(),
  shadowColor: withVariants(colorValueSchema).optional(),

  margin: withVariants(marginSchema).optional(),
  padding: withVariants(paddingSchema).optional(),

  width: withVariants(sizeValueSchema).optional(),
  height: withVariants(sizeValueSchema).optional(),
  minWidth: withVariants(sizeValueSchema).optional(),
  maxWidth: withVariants(sizeValueSchema).optional(),
  minHeight: withVariants(sizeValueSchema).optional(),
  maxHeight: withVariants(sizeValueSchema).optional(),

  borderWidth: withVariants(borderWidthSchema).optional(),
  borderStyle: withVariants(borderStyleSchema).optional(),
  radius: withVariants(radiusSchema).optional(),
  shadow: withVariants(shadowSizeSchema).optional(),
});

export const containerStylePropsSchema = sharedStylePropsSchema
  .extend({
    as: containerElementSchema.optional(),
    flex: flexSchema.optional(),
    grid: gridSchema.optional(),
    position: positionSchema.optional(),
    overflow: overflowSchema.optional(),
    flexItem: flexItemSchema.optional(),
    gridItem: gridItemSchema.optional(),
    /** Hides the Container (display: none), e.g. { base: true, md: false }. */
    hidden: withVariants(z.boolean()).optional(),
  })
  .strict();

/** Icon's style props: the shared ones plus size (width and height together) and stroke width. */
export const iconStylePropsSchema = sharedStylePropsSchema
  .extend({
    /** Width and height in px. Default 24. */
    size: withVariants(z.number().positive()).optional(),
    /** Line thickness of the icon's strokes, in the icon's 24-unit grid. Default 2. */
    strokeWidth: z.number().positive().optional(),
  })
  .strict();

/**
 * Button's style props (decision 0054): a variant and one colour that it styles from, optional colour overrides,
 * spacing and width. Height, radius, border width and font are fixed by the button.
 */
export const buttonStylePropsSchema = sharedStylePropsSchema
  .pick({ bgColor: true, textColor: true, borderColor: true, margin: true, padding: true, width: true, minWidth: true, maxWidth: true })
  .extend({
    /** How the colour is applied. Default 'filled'. */
    variant: buttonVariantSchema.optional(),
    /** The colour the variant styles the button with. Default 'primary' (500). */
    color: solidColorValueSchema.optional(),
  })
  .strict();

/**
 * Input's style props (decision 0055): a variant and the colour its border and focus use, spacing and width.
 * Height, radius, font and the resting colours are fixed by the input.
 */
export const inputStylePropsSchema = sharedStylePropsSchema
  .pick({ margin: true, padding: true, width: true, minWidth: true, maxWidth: true })
  .extend({
    /** How the field is drawn. Default 'outlined'. */
    variant: inputVariantSchema.optional(),
    /** The colour of the focused border and the floated label. Default 'primary' (500). */
    color: solidColorValueSchema.optional(),
  })
  .strict();

/** Checkbox's style props (decision 0057): the colour of its outline and fill, and spacing. The box is fixed. */
export const checkboxStylePropsSchema = sharedStylePropsSchema
  .pick({ margin: true, padding: true })
  .extend({
    /** The outline, the checked fill and the focus outline. Default 'primary' (500). */
    color: solidColorValueSchema.optional(),
  })
  .strict();

export const textStylePropsSchema = sharedStylePropsSchema
  .extend({
    as: textElementSchema.optional(),
    fontFamily: withVariants(fontFamilySchema).optional(),
    fontSize: withVariants(z.number().positive()).optional(),
    fontWeight: withVariants(fontWeightSchema).optional(),
    align: withVariants(textAlignSchema).optional(),
    lineHeight: withVariants(z.number().positive()).optional(),
    letterSpacing: withVariants(z.number()).optional(),
    truncate: withVariants(truncateSchema).optional(),
  })
  .strict();
