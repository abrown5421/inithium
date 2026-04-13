import { ThemeColor } from "@inithium/types";

export type PopoverVariant = "filled" | "outlined" | "ghost";
export type PopoverSize = "sm" | "base" | "lg" | "xl";

export interface PopoverProps extends React.ComponentPropsWithoutRef<"button"> {
  variant?: PopoverVariant;
  size?: PopoverSize;
  color?: ThemeColor;
  buttonLabel: React.ReactNode;
  panelClassName?: string;
  children: React.ReactNode;
}
