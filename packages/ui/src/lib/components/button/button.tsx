import React from "react";
import { Button as HeadlessButton } from "@headlessui/react";
import {
  BaseButtonProps,
  ButtonSize,
  ButtonVariant,
} from "./button.types";
import { cn } from "@inithium/utils";
import { ThemeColor } from "@inithium/types";

const COLOR_MAP: Record<
  ThemeColor,
  {
    base: string;
    text: string;
    border: string;
    contrast: string;
    hoverBase: string;
    hoverBaseContrast: string;
    hoverText: string;
    hoverContrast: string;
    hoverBorderB: string;
  }
> = {
  primary: {
    base: "bg-primary",
    text: "text-primary",
    border: "border-primary",
    contrast: "text-primary-contrast",
    hoverBase: "hover:bg-primary",
    hoverBaseContrast: "hover:bg-primary-contrast",
    hoverText: "hover:text-primary",
    hoverContrast: "hover:text-primary-contrast",
    hoverBorderB: "hover:border-b-primary",
  },
  secondary: {
    base: "bg-secondary",
    text: "text-secondary",
    border: "border-secondary",
    contrast: "text-secondary-contrast",
    hoverBase: "hover:bg-secondary",
    hoverBaseContrast: "hover:bg-secondary-contrast",
    hoverText: "hover:text-secondary",
    hoverContrast: "hover:text-secondary-contrast",
    hoverBorderB: "hover:border-b-secondary",
  },
  accent: {
    base: "bg-accent",
    text: "text-accent",
    border: "border-accent",
    contrast: "text-accent-contrast",
    hoverBase: "hover:bg-accent",
    hoverBaseContrast: "hover:bg-accent-contrast",
    hoverText: "hover:text-accent",
    hoverContrast: "hover:text-accent-contrast",
    hoverBorderB: "hover:border-b-accent",
  },
  success: {
    base: "bg-success",
    text: "text-success",
    border: "border-success",
    contrast: "text-success-contrast",
    hoverBase: "hover:bg-success",
    hoverBaseContrast: "hover:bg-success-contrast",
    hoverText: "hover:text-success",
    hoverContrast: "hover:text-success-contrast",
    hoverBorderB: "hover:border-b-success",
  },
  warning: {
    base: "bg-warning",
    text: "text-warning",
    border: "border-warning",
    contrast: "text-warning-contrast",
    hoverBase: "hover:bg-warning",
    hoverBaseContrast: "hover:bg-warning-contrast",
    hoverText: "hover:text-warning",
    hoverContrast: "hover:text-warning-contrast",
    hoverBorderB: "hover:border-b-warning",
  },
  danger: {
    base: "bg-danger",
    text: "text-danger",
    border: "border-danger",
    contrast: "text-danger-contrast",
    hoverBase: "hover:bg-danger",
    hoverBaseContrast: "hover:bg-danger-contrast",
    hoverText: "hover:text-danger",
    hoverContrast: "hover:text-danger-contrast",
    hoverBorderB: "hover:border-b-danger",
  },
  info: {
    base: "bg-info",
    text: "text-info",
    border: "border-info",
    contrast: "text-info-contrast",
    hoverBase: "hover:bg-info",
    hoverBaseContrast: "hover:bg-info-contrast",
    hoverText: "hover:text-info",
    hoverContrast: "hover:text-info-contrast",
    hoverBorderB: "hover:border-b-info",
  },
  surface2: {
    base: "bg-surface2",
    text: "text-surface2",
    border: "border-surface2",
    contrast: "text-surface2-contrast",
    hoverBase: "hover:bg-surface2",
    hoverBaseContrast: "hover:bg-surface2-contrast",
    hoverText: "hover:text-surface2",
    hoverContrast: "hover:text-surface2-contrast",
    hoverBorderB: "hover:border-b-surface2",
  },
};

const SIZE_MAP: Record<ButtonSize, string> = {
  sm: "px-3 py-1 text-xs",
  base: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-lg",
  xl: "px-8 py-4 text-xl",
};

const getVariantStyles = (
  variant: ButtonVariant,
  color: ThemeColor,
): string => {
  const c = COLOR_MAP[color];

  const styles: Record<ButtonVariant, string> = {
    filled: cn(c.base, c.border, c.contrast, c.hoverText, c.hoverBaseContrast),
    outlined: cn(
      "bg-transparent",
      c.border,
      c.text,
      c.hoverContrast,
      c.hoverBase,
    ),
    ghost: cn(
      "border-2 border-transparent text-surface-contrast",
      c.hoverText,
      c.hoverBorderB,
      "hover:border-t-transparent hover:border-r-transparent hover:border-l-transparent",
      "hover:shadow-glow",
    ),
  };

  return styles[variant];
};

export const Button: React.FC<BaseButtonProps> = ({
  variant = "filled",
  size = "base",
  color = "primary",
  className = "",
  style,
  onClick,
  children,
  ...props
}) => {
  const baseClasses =
    "border-2 rounded-md transition duration-200 ease-in-out focus:outline-none data-[focus]:outline-white hover:cursor-pointer";
  const variantClasses = getVariantStyles(variant, color);
  const sizeClasses = SIZE_MAP[size];

  return (
    <HeadlessButton
      {...props}
      onClick={onClick}
      style={style}
      className={cn(baseClasses, variantClasses, sizeClasses, className)}
    >
      {children}
    </HeadlessButton>
  );
};