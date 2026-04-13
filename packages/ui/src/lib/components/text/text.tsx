import React from "react";
import { BaseTextProps } from "./text.types";
import { cn } from "@inithium/utils";
import { ThemeColor } from "@inithium/types";
import {
  TEXT_COLOR_MAP,
  FONT_MAP,
  TEXT_SIZE_MAP,
  WEIGHT_MAP,
  FONT_STYLE_MAP,
  DECORATION_MAP,
} from "@inithium/utils";
import type { ThemeFont, TextSize, TextWeight, TextStyle, TextDecoration } from "@inithium/types";

const getTextStyles = (
  color: ThemeColor,
  font: ThemeFont,
  size: TextSize,
  weight: TextWeight,
  fontStyle: TextStyle,
  decoration: TextDecoration,
): string =>
  cn(
    TEXT_COLOR_MAP[color].text,
    FONT_MAP[font],
    TEXT_SIZE_MAP[size],
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
  const textClasses = getTextStyles(color, font, size, weight, fontStyle, decoration);

  return (
    <Tag {...props} style={style} className={cn(textClasses, className)}>
      {children}
    </Tag>
  );
};