import React from "react";
import { Button as HeadlessButton } from "@headlessui/react";
import { BaseButtonProps, ButtonVariant } from "./button.types";
import { cn, INTERACTIVE_COLOR_MAP, COMPONENT_SIZE_MAP } from "@inithium/utils";
import { ThemeColor, ComponentSize } from "@inithium/types";

const getVariantStyles = (variant: ButtonVariant, color: ThemeColor): string => {
  const c = INTERACTIVE_COLOR_MAP[color];

  const styles: Record<ButtonVariant, string> = {
    filled: cn(c.bg, c.border, c.textContrast, c.hoverBgContrast, c.hoverText),
    outlined: cn(c.bgContrast, c.border, c.text, c.hoverBg, c.hoverTextContrast),
    ghost: cn(
      "border-2 border-transparent",
      c.text,
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

  return (
    <HeadlessButton
      {...props}
      onClick={onClick}
      style={style}
      className={cn(baseClasses, getVariantStyles(variant, color), COMPONENT_SIZE_MAP[size as ComponentSize], className)}
    >
      {children}
    </HeadlessButton>
  );
};