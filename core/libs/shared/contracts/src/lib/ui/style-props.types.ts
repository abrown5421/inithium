import type { z } from 'zod';
import type { colorValueSchema, solidColorValueSchema, themeColorSchema } from './colors.schema';
import type {
  buttonStylePropsSchema,
  containerStylePropsSchema,
  iconStylePropsSchema,
  sharedStylePropsSchema,
  textStylePropsSchema,
} from './style-props.schema';

export type ThemeColor = z.infer<typeof themeColorSchema>;
export type ColorValue = z.infer<typeof colorValueSchema>;
export type SolidColorValue = z.infer<typeof solidColorValueSchema>;
export type SharedStyleProps = z.infer<typeof sharedStylePropsSchema>;
export type ButtonStyleProps = z.infer<typeof buttonStylePropsSchema>;
export type ContainerStyleProps = z.infer<typeof containerStylePropsSchema>;
export type TextStyleProps = z.infer<typeof textStylePropsSchema>;
export type IconStyleProps = z.infer<typeof iconStylePropsSchema>;
