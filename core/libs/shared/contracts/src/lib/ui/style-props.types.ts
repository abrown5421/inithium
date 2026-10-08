import type { z } from 'zod';
import type { colorValueSchema, themeColorSchema } from './colors.schema';
import type { containerStylePropsSchema, sharedStylePropsSchema, textStylePropsSchema } from './style-props.schema';

export type ThemeColor = z.infer<typeof themeColorSchema>;
export type ColorValue = z.infer<typeof colorValueSchema>;
export type SharedStyleProps = z.infer<typeof sharedStylePropsSchema>;
export type ContainerStyleProps = z.infer<typeof containerStylePropsSchema>;
export type TextStyleProps = z.infer<typeof textStylePropsSchema>;
