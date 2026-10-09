import type { z } from 'zod';
import type { colorValueSchema, solidColorValueSchema, themeColorSchema } from './colors.schema';
import type {
  buttonStylePropsSchema,
  checkboxStylePropsSchema,
  containerStylePropsSchema,
  dividerStylePropsSchema,
  iconStylePropsSchema,
  inputStylePropsSchema,
  loaderStylePropsSchema,
  sharedStylePropsSchema,
  switchStylePropsSchema,
  textStylePropsSchema,
} from './style-props.schema';

export type ThemeColor = z.infer<typeof themeColorSchema>;
export type ColorValue = z.infer<typeof colorValueSchema>;
export type SolidColorValue = z.infer<typeof solidColorValueSchema>;
export type SharedStyleProps = z.infer<typeof sharedStylePropsSchema>;
export type ButtonStyleProps = z.infer<typeof buttonStylePropsSchema>;
export type CheckboxStyleProps = z.infer<typeof checkboxStylePropsSchema>;
export type ContainerStyleProps = z.infer<typeof containerStylePropsSchema>;
export type SwitchStyleProps = z.infer<typeof switchStylePropsSchema>;
export type TextStyleProps = z.infer<typeof textStylePropsSchema>;
export type InputStyleProps = z.infer<typeof inputStylePropsSchema>;
export type LoaderStyleProps = z.infer<typeof loaderStylePropsSchema>;
export type DividerStyleProps = z.infer<typeof dividerStylePropsSchema>;
export type IconStyleProps = z.infer<typeof iconStylePropsSchema>;
