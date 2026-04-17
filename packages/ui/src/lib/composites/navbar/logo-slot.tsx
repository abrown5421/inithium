import React from "react";
import { NavbarLogoProps } from "./navbar.types";
import { Box } from "../../components/box";
import { Text } from "../../components/text";

interface LogoSlotProps extends NavbarLogoProps {
  className?: string;
}

export const LogoSlot: React.FC<LogoSlotProps> = ({ imageSrc, title, className }) => {
  if (!imageSrc && !title) return null;

  return (
    <Box className={`flex items-center gap-2 shrink-0 ${className ?? ""}`}>
      {imageSrc && (
        <img
          src={imageSrc}
          alt={title ?? "Logo"}
          className="h-16 w-auto object-contain"
        />
      )}
      {title && (
        <Text size="lg" weight="bold" color="surface2-contrast" font="display">
          {title}
        </Text>
      )}
    </Box>
  );
};