import { ThemeColor } from "@inithium/types";

export interface InteractiveColorTokens {
  bg: string;
  bgContrast: string;
  text: string;
  textContrast: string;
  border: string;
  hoverBg: string;
  hoverBgContrast: string;
  hoverText: string;
  hoverTextContrast: string;
  hoverBorderB: string;
}

export const INTERACTIVE_COLOR_MAP: Record<ThemeColor, InteractiveColorTokens> =
  {
    primary: {
      bg: "bg-primary",
      bgContrast: "bg-primary-contrast",
      text: "text-primary",
      textContrast: "text-primary-contrast",
      border: "border-primary",
      hoverBg: "hover:bg-primary",
      hoverBgContrast: "hover:bg-primary-contrast",
      hoverText: "hover:text-primary",
      hoverTextContrast: "hover:text-primary-contrast",
      hoverBorderB: "hover:border-b-primary",
    },
    secondary: {
      bg: "bg-secondary",
      bgContrast: "bg-secondary-contrast",
      text: "text-secondary",
      textContrast: "text-secondary-contrast",
      border: "border-secondary",
      hoverBg: "hover:bg-secondary",
      hoverBgContrast: "hover:bg-secondary-contrast",
      hoverText: "hover:text-secondary",
      hoverTextContrast: "hover:text-secondary-contrast",
      hoverBorderB: "hover:border-b-secondary",
    },
    accent: {
      bg: "bg-accent",
      bgContrast: "bg-accent-contrast",
      text: "text-accent",
      textContrast: "text-accent-contrast",
      border: "border-accent",
      hoverBg: "hover:bg-accent",
      hoverBgContrast: "hover:bg-accent-contrast",
      hoverText: "hover:text-accent",
      hoverTextContrast: "hover:text-accent-contrast",
      hoverBorderB: "hover:border-b-accent",
    },
    success: {
      bg: "bg-success",
      bgContrast: "bg-success-contrast",
      text: "text-success",
      textContrast: "text-success-contrast",
      border: "border-success",
      hoverBg: "hover:bg-success",
      hoverBgContrast: "hover:bg-success-contrast",
      hoverText: "hover:text-success",
      hoverTextContrast: "hover:text-success-contrast",
      hoverBorderB: "hover:border-b-success",
    },
    warning: {
      bg: "bg-warning",
      bgContrast: "bg-warning-contrast",
      text: "text-warning",
      textContrast: "text-warning-contrast",
      border: "border-warning",
      hoverBg: "hover:bg-warning",
      hoverBgContrast: "hover:bg-warning-contrast",
      hoverText: "hover:text-warning",
      hoverTextContrast: "hover:text-warning-contrast",
      hoverBorderB: "hover:border-b-warning",
    },
    danger: {
      bg: "bg-danger",
      bgContrast: "bg-danger-contrast",
      text: "text-danger",
      textContrast: "text-danger-contrast",
      border: "border-danger",
      hoverBg: "hover:bg-danger",
      hoverBgContrast: "hover:bg-danger-contrast",
      hoverText: "hover:text-danger",
      hoverTextContrast: "hover:text-danger-contrast",
      hoverBorderB: "hover:border-b-danger",
    },
    info: {
      bg: "bg-info",
      bgContrast: "bg-info-contrast",
      text: "text-info",
      textContrast: "text-info-contrast",
      border: "border-info",
      hoverBg: "hover:bg-info",
      hoverBgContrast: "hover:bg-info-contrast",
      hoverText: "hover:text-info",
      hoverTextContrast: "hover:text-info-contrast",
      hoverBorderB: "hover:border-b-info",
    },
    surface2: {
      bg: "bg-surface2",
      bgContrast: "bg-surface2-contrast",
      text: "text-surface2",
      textContrast: "text-surface2-contrast",
      border: "border-surface2",
      hoverBg: "hover:bg-surface2",
      hoverBgContrast: "hover:bg-surface2-contrast",
      hoverText: "hover:text-surface2",
      hoverTextContrast: "hover:text-surface2-contrast",
      hoverBorderB: "hover:border-b-surface2",
    },
  };

export const TEXT_COLOR_MAP: Record<ThemeColor, { text: string }> =
  Object.fromEntries(
    (Object.keys(INTERACTIVE_COLOR_MAP) as ThemeColor[]).map((color) => [
      color,
      { text: INTERACTIVE_COLOR_MAP[color].text },
    ]),
  ) as Record<ThemeColor, { text: string }>;

export const BG_COLOR_MAP: Record<ThemeColor, string> = Object.fromEntries(
  (Object.keys(INTERACTIVE_COLOR_MAP) as ThemeColor[]).map((color) => [
    color,
    INTERACTIVE_COLOR_MAP[color].bg,
  ]),
) as Record<ThemeColor, string>;

export const BORDER_COLOR_MAP: Record<ThemeColor, string> = Object.fromEntries(
  (Object.keys(INTERACTIVE_COLOR_MAP) as ThemeColor[]).map((color) => [
    color,
    INTERACTIVE_COLOR_MAP[color].border,
  ]),
) as Record<ThemeColor, string>;
