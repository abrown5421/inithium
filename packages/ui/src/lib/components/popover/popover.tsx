import React from "react";
import { Popover as HeadlessPopover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { cn, INTERACTIVE_COLOR_MAP, COMPONENT_SIZE_MAP } from "@inithium/utils";
import { ThemeColor, ComponentSize } from "@inithium/types";
import { PopoverVariant, PopoverProps } from "./popover.types";

const getVariantStyles = (variant: PopoverVariant, color: ThemeColor): string => {
  const c = INTERACTIVE_COLOR_MAP[color];

  const styles: Record<PopoverVariant, string> = {
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

export const Popover: React.FC<PopoverProps> = ({
  variant = "filled",
  size = "base",
  color = "primary",
  className = "",
  panelClassName = "",
  buttonLabel,
  children,
  ...props
}) => {
  const triggerClasses = cn(
    "border-2 rounded-md transition duration-200 ease-in-out focus:outline-none data-[active]:scale-[0.98] hover:cursor-pointer",
    getVariantStyles(variant, color),
    COMPONENT_SIZE_MAP[size as ComponentSize],
    className,
  );

  return (
    <HeadlessPopover className="relative">
      <PopoverButton {...props} className={triggerClasses}>
        {buttonLabel}
      </PopoverButton>
      <PopoverPanel
        unmount
        className={cn(
          "absolute z-10 mt-3 w-screen max-w-sm rounded-xl bg-surface p-4 shadow-lg ring-1 ring-black/5 transition duration-200 ease-out data-[closed]:scale-95 data-[closed]:opacity-0",
          panelClassName,
        )}
      >
        {children}
      </PopoverPanel>
    </HeadlessPopover>
  );
};