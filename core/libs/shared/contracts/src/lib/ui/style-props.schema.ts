import { z } from 'zod';
import { borderStyleSchema, borderWidthSchema, radiusSchema, shadowSizeSchema } from './borders.schema';
import { colorValueSchema } from './colors.schema';
import { containerElementSchema, textElementSchema } from './elements.schema';
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
