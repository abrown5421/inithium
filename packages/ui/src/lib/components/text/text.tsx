import React from "react";
import {
  BaseTextProps,
  TextDecoration,
  TextSize,
  TextStyle,
  TextWeight,
  ThemeFont,
} from "./text.types";
import { cn } from "@inithium/utils";
import { ThemeColor } from "@inithium/types";

const COLOR_MAP: Record<ThemeColor, { text: string }> = {
  primary: { text: "text-primary" },
  secondary: { text: "text-secondary" },
  accent: { text: "text-accent" },
  success: { text: "text-success" },
  warning: { text: "text-warning" },
  danger: { text: "text-danger" },
  info: { text: "text-info" },
  surface2: { text: "text-surface2" },
};

const FONT_MAP: Record<ThemeFont, string> = {
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

const SIZE_MAP: Record<TextSize, string> = {
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

const WEIGHT_MAP: Record<TextWeight, string> = {
  thin: "font-thin",
  light: "font-light",
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
  extrabold: "font-extrabold",
  black: "font-black",
};

const FONT_STYLE_MAP: Record<TextStyle, string> = {
  normal: "not-italic",
  italic: "italic",
};

const DECORATION_MAP: Record<TextDecoration, string> = {
  none: "no-underline",
  underline: "underline",
  "line-through": "line-through",
  overline: "overline",
};

const getTextStyles = (
  color: ThemeColor,
  font: ThemeFont,
  size: TextSize,
  weight: TextWeight,
  fontStyle: TextStyle,
  decoration: TextDecoration,
): string =>
  cn(
    COLOR_MAP[color].text,
    FONT_MAP[font],
    SIZE_MAP[size],
    WEIGHT_MAP[weight],
    FONT_STYLE_MAP[fontStyle],
    DECORATION_MAP[decoration],
  );

export const Text: React.FC<BaseTextProps> = ({
  as: Tag = "p",
  color = "primary",
  font = "sans",
  size = "base",
  weight = "normal",
  fontStyle = "normal",
  decoration = "none",
  className = "",
  style,
  children,
  ...props
}) => {
  const textClasses = getTextStyles(
    color,
    font,
    size,
    weight,
    fontStyle,
    decoration,
  );

  return (
    <Tag {...props} style={style} className={cn(textClasses, className)}>
      {children}
    </Tag>
  );
};
