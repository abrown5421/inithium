import React from "react";
import { Box } from "../../components/box";
import { Text } from "../../components/text";
import { FooterProps } from "./footer.types";
import { FooterPrimaryNav } from "./primary-nav-slot";
import { FooterSecondaryNav } from "./secondary-nav-slot";


const getPagesByLocation = (pages: any[], location: string) =>
  pages.filter((p) => {
    const loc = p.navigation?.location ?? p.location;
    return loc ? loc === location : location === "main";
  });

const defaultCopyright = `© ${new Date().getFullYear()} All rights reserved.`;

export const Footer: React.FC<FooterProps> = ({
  pages,
  onNavigate,
  copyright = defaultCopyright,
}) => {
  const mainPages = getPagesByLocation(pages, "main");
  const footerPages = getPagesByLocation(pages, "footer");

  return (
    <Box
      as="footer"
      bg="surface2"
      px="4"
      direction="col"
      className="w-full border-t border-surface3 shadow-[0_-1px_3px_0_rgb(0,0,0,0.05)]"
    >
      <Box direction="row" align="center" justify="start" py="3" className="border-b border-surface3">
        <FooterPrimaryNav pages={mainPages} onNavigate={onNavigate} />
      </Box>

      <Box direction="row" align="center" gap="2" py="3" className="flex-col sm:flex-row items-start sm:items-center">
        <Text
          size="xs"
          color="surface2-contrast"
          className="opacity-60 whitespace-nowrap shrink-0"
        >
          {copyright}
        </Text>
        <Text
          size="xs"
          color="surface-contrast"
          className="opacity-60 whitespace-nowrap shrink-0"
        >|</Text>
        
        <FooterSecondaryNav pages={footerPages} onNavigate={onNavigate} />
      </Box>
    </Box>
  );
};