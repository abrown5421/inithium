import React from "react";
import { PageRegistryEntry, NavItemGroup, NavItemLink } from "../navbar/navbar.types";
import { Box } from "../../components/box";
import { usePageTransition } from "@inithium/store";

interface FooterSecondaryNavProps {
  pages: PageRegistryEntry[];
  onNavigate?: (path: string) => void;
}

const isGroup = (item: PageRegistryEntry): item is NavItemGroup =>
  (item as any).type === "group";

const flattenFooterPages = (
  pages: PageRegistryEntry[]
): { path: string; label: string }[] => {
  const result: { path: string; label: string }[] = [];
  for (const page of pages) {
    if ((page as any).showInNav === false) continue;
    if (isGroup(page)) {
      for (const child of page.children) {
        if (child.showInNav !== false) {
          result.push({ path: child.path, label: child.label });
        }
      }
    } else {
      result.push({ path: page.path, label: page.label });
    }
  }
  return result;
};

const FooterSecondaryLink: React.FC<{
  path: string;
  label: string;
  onNavigate?: (path: string) => void;
}> = ({ path, label, onNavigate }) => {
  const { controller } = usePageTransition();

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    await controller.triggerExit();
    onNavigate?.(path);
  };

  return (
    <a
      href={path}
      onClick={handleClick}
      className="text-xs text-surface2-contrast hover:text-primary transition-colors"
    >
      {label}
    </a>
  );
};

export const FooterSecondaryNav: React.FC<FooterSecondaryNavProps> = ({
  pages,
  onNavigate,
}) => {
  const links = flattenFooterPages(pages);

  if (links.length === 0) return null;

  return (
    <Box
      as="nav"
      direction="row"
      wrap="wrap"
      align="center"
      gap="1"
      aria-label="Footer secondary navigation"
    >
      {links.map((link) => (
        <FooterSecondaryLink
          key={link.path}
          path={link.path}
          label={link.label}
          onNavigate={onNavigate}
        />
      ))}
    </Box>
  );
};