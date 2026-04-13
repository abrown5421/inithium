import {
  ComponentSize,
  TextDecoration,
  TextSize,
  TextStyle,
  TextWeight,
  ThemeFont,
} from "@inithium/types";

export const FONT_MAP: Record<ThemeFont, string> = {
  sans: "font-sans",
  serif: "font-serif",
  mono: "font-mono",
  display: "font-display",
  body: "font-body",
  "inter-tight": "inter-tight",
  "plus-jakarta-sans": "plus-jakarta-sans",
  sora: "sora",
  "dm-sans": "dm-sans",
  lora: "lora",
  "space-grotesk": "space-grotesk",
  nunito: "nunito",
  raleway: "raleway",
  mulish: "mulish",
  merriweather: "merriweather",
  "playfair-display": "playfair-display",
  "ibm-plex-mono": "ibm-plex-mono",
  fraunces: "fraunces",
  outfit: "outfit",
  manrope: "manrope",
  barlow: "barlow",
  epilogue: "epilogue",
  "libre-baskerville": "libre-baskerville",
  "josefin-sans": "josefin-sans",
  "space-mono": "space-mono",
};

export const TEXT_SIZE_MAP: Record<TextSize, string> = {
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
  "4xl": "text-4xl",
  "5xl": "text-5xl",
};

export const WEIGHT_MAP: Record<TextWeight, string> = {
  thin: "font-thin",
  light: "font-light",
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
  extrabold: "font-extrabold",
  black: "font-black",
};

export const FONT_STYLE_MAP: Record<TextStyle, string> = {
  normal: "not-italic",
  italic: "italic",
};

export const DECORATION_MAP: Record<TextDecoration, string> = {
  none: "no-underline",
  underline: "underline",
  "line-through": "line-through",
  overline: "overline",
};

export const COMPONENT_SIZE_MAP: Record<ComponentSize, string> = {
  sm: "px-3 py-1 text-xs",
  base: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-lg",
  xl: "px-8 py-4 text-xl",
};