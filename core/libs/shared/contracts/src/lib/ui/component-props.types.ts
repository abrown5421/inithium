import type { z } from 'zod';
import type {
  autoIncrementingListPropsSchema,
  avatarPropsSchema,
  breadcrumbsPropsSchema,
  buttonPropsSchema,
  checkboxPropsSchema,
  colorPickerPropsSchema,
  containerPropsSchema,
  dividerPropsSchema,
  drawerPropsSchema,
  footerPropsSchema,
  iconPropsSchema,
  inputPropsSchema,
  loaderPropsSchema,
  modalPropsSchema,
  navbarPropsSchema,
  paginationPropsSchema,
  polyBannerPropsSchema,
  radioGroupPropsSchema,
  selectPropsSchema,
  sliderPropsSchema,
  switchPropsSchema,
  tabsPropsSchema,
  textPropsSchema,
  tooltipPropsSchema,
} from './component-props.schema';

/** An AutoIncrementingList's storable props: label, helper text, limits, button colours and wording, alignment, spacing and animation. */
export type AutoIncrementingListSerializableProps = z.infer<typeof autoIncrementingListPropsSchema>;

/** An Avatar's storable props: size, margin, editable, name, label and animation. */
export type AvatarSerializableProps = z.infer<typeof avatarPropsSchema>;

/** A Breadcrumbs' storable props: trail, separator, maxItems, colour, spacing and animation. */
export type BreadcrumbsSerializableProps = z.infer<typeof breadcrumbsPropsSchema>;

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

/** A Select's storable props: options, variant, colour, label, placeholder, helper text, required, icon, spacing, width and animation. */
export type SelectSerializableProps = z.infer<typeof selectPropsSchema>;

/** A Slider's storable props: range, step, marks, value label, label, helper text, colour, spacing, width and animation. */
export type SliderSerializableProps = z.infer<typeof sliderPropsSchema>;

/** A Tooltip's storable props: content, side, align, colour, delay and arrow. */
export type TooltipSerializableProps = z.infer<typeof tooltipPropsSchema>;

/** A Modal's storable props: title, description, closing behaviour, overlay colour, animation and panel style props. */
export type ModalSerializableProps = z.infer<typeof modalPropsSchema>;

/** Tabs' storable props: the tabs (value, label, icon, disabled), colour, fill, spacing and animation. */
export type TabsSerializableProps = z.infer<typeof tabsPropsSchema>;

/** A ColorPicker's storable props: field style props, label, placeholder, helper text, required, palette and animation. */
export type ColorPickerSerializableProps = z.infer<typeof colorPickerPropsSchema>;

/** A Drawer's storable props: title, description, side, size, closing behaviour, overlay colour, animation and panel style props. */
export type DrawerSerializableProps = z.infer<typeof drawerPropsSchema>;

/** A Footer's storable props: links, secondary links, copyright, alignment, colours, spacing and animation. */
export type FooterSerializableProps = z.infer<typeof footerPropsSchema>;

/** A Navbar's storable props: logo, title, links, addresses, collapse point, alignment, colours, spacing and animation. */
export type NavbarSerializableProps = z.infer<typeof navbarPropsSchema>;

/** A Pagination's storable props: colour, sibling count, first/last buttons, compact mode, page sizes, spacing and animation. */
export type PaginationSerializableProps = z.infer<typeof paginationPropsSchema>;

/** A PolyBanner's storable props: size, radius, margin, editable, label and animation. */
export type PolyBannerSerializableProps = z.infer<typeof polyBannerPropsSchema>;

/** A Container's storable props: style props, animation and stagger. */
export type ContainerSerializableProps = z.infer<typeof containerPropsSchema>;

/** A Text's storable props: style props and animation. */
export type TextSerializableProps = z.infer<typeof textPropsSchema>;

/** An Icon's storable props: name, label, style props and animation. */
export type IconSerializableProps = z.infer<typeof iconPropsSchema>;
