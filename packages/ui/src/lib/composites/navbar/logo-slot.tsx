import React from "react";
import { NavbarLogoProps } from "./navbar.types";
import { Box } from "../../components/box";
import { Text } from "../../components/text";
import { useLocation } from 'react-router-dom';

interface LogoSlotProps extends NavbarLogoProps {
  className?: string;
}

function useCollapseTransition(shouldCollapse: boolean) {
  const [isCollapsed, setIsCollapsed] = React.useState(shouldCollapse);

  React.useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setIsCollapsed(shouldCollapse);
    });
    return () => cancelAnimationFrame(frame);
  }, [shouldCollapse]);

  return isCollapsed;
}

export const LogoSlot: React.FC<LogoSlotProps> = ({ imageSrc, title, className, collapseOnHome }) => {
  if (!imageSrc && !title) return null;
  const location = useLocation();

  const isCollapsed = useCollapseTransition((collapseOnHome ?? false) && location.pathname === '/');

  return (
    <Box className={`flex items-center gap-2 shrink-0 ${className ?? ""}`}>
      {imageSrc && (
        <div
          className="overflow-hidden transition-[max-width] duration-500 ease-in-out"
          style={{ maxWidth: isCollapsed ? '0px' : '200px' }}
        >
          <img
            src={imageSrc}
            alt={title ?? "Logo"}
            className="h-16 w-auto object-contain"
          />
        </div>
      )}
      {title && (
        <Text size="lg" weight="bold" color="surface2-contrast" font="display">
          {title}
        </Text>
      )}
    </Box>
  );
};