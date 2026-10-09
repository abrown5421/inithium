import type { z } from 'zod';
import type {
  buttonPropsSchema,
  checkboxPropsSchema,
  containerPropsSchema,
  dividerPropsSchema,
  iconPropsSchema,
  inputPropsSchema,
  loaderPropsSchema,
  radioGroupPropsSchema,
  switchPropsSchema,
  textPropsSchema,
} from './component-props.schema';

/** A Button's storable props: variant, colours, spacing, width, icons and animation. */
export type ButtonSerializableProps = z.infer<typeof buttonPropsSchema>;

/** An Input's storable props: variant, colour, type, label, placeholder, helper text, icons, spacing and animation. */
export type InputSerializableProps = z.infer<typeof inputPropsSchema>;

/** A Checkbox's storable props: colour, label, helper text, required, spacing and animation. */
export type CheckboxSerializableProps = z.infer<typeof checkboxPropsSchema>;

/** A Loader's storable props: variant, colour, size, label, spacing, width and animation. */
export type LoaderSerializableProps = z.infer<typeof loaderPropsSchema>;

/** A Switch's storable props: colour, label and its placement, helper text, required, thumb icons, spacing and animation. */
export type SwitchSerializableProps = z.infer<typeof switchPropsSchema>;

/** A Divider's storable props: orientation, line colour, thickness and style, label, spacing and animation. */
export type DividerSerializableProps = z.infer<typeof dividerPropsSchema>;

/** A RadioGroup's storable props: options, label, helper text, required, variant, orientation, colour, spacing and animation. */
export type RadioGroupSerializableProps = z.infer<typeof radioGroupPropsSchema>;

/** A Container's storable props: style props, animation and stagger. */
export type ContainerSerializableProps = z.infer<typeof containerPropsSchema>;

/** A Text's storable props: style props and animation. */
export type TextSerializableProps = z.infer<typeof textPropsSchema>;

/** An Icon's storable props: name, label, style props and animation. */
export type IconSerializableProps = z.infer<typeof iconPropsSchema>;
