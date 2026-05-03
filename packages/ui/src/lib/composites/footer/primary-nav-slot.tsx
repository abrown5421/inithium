import React from "react";
import { PageRegistryEntry, NavItemGroup, NavItemLink } from "../navbar/navbar.types";
import { Dropdown } from "../../components/dropdown";
import { Icon } from "../../components/icon";
import { Box } from "../../components/box";
import { Text } from "../../components/text";
import { usePageTransition } from "@inithium/store";

interface FooterPrimaryNavProps {
  pages: PageRegistryEntry[];
  onNavigate?: (path: string) => void;
}

const isGroup = (item: PageRegistryEntry): item is NavItemGroup =>
  (item as any).type === "group";

const FooterNavLink: React.FC<{
  page: NavItemLink;
  onNavigate?: (path: string) => void;
}> = ({ page, onNavigate }) => {
  const { controller } = usePageTransition();

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    await controller.triggerExit();
    onNavigate?.(page.path);
  };

  return (
    <a
      href={page.path}
      onClick={handleClick}
      className="px-3 py-1.5 rounded-md text-sm font-medium text-surface2-contrast hover:bg-surface3 transition-colors duration-150"
    >
      {page.label}
    </a>
  );
};

const FooterNavGroup: React.FC<{
  page: NavItemGroup;
  onNavigate?: (path: string) => void;
}> = ({ page, onNavigate }) => {
  const { controller } = usePageTransition();

  const items = page.children
    .filter((c) => c.showInNav !== false)
    .map((c) => ({ label: c.label, value: c.path }));

  if (items.length === 0) return null;

  const handleSelect = async (path: string) => {
    await controller.triggerExit();
    onNavigate?.(path);
  };

  return (
    <Dropdown
      variant="ghost"
      color="surface3"
      size="sm"
      anchor="top start"
      items={items}
      onSelect={handleSelect}
      trigger={
        <>
          <Text size="sm" weight="medium">{page.label}</Text>
          <Icon name="ChevronDownIcon" iconStyle="solid-16" size="xs" aria-hidden />
        </>
      }
      triggerClassName="gap-1"
    />
  );
};

export const FooterPrimaryNav: React.FC<FooterPrimaryNavProps> = ({
  pages,
  onNavigate,
}) => {
  const visible = pages.filter((p) => (p as any).showInNav !== false);

  if (visible.length === 0) return null;

  return (
    <Box
      as="nav"
      direction="row"
      wrap="wrap"
      align="center"
      gap="1"
      aria-label="Footer primary navigation"
    >
      {visible.map((page) =>
        isGroup(page) ? (
          <FooterNavGroup key={page.path} page={page} onNavigate={onNavigate} />
        ) : (
          <FooterNavLink
            key={page.path}
            page={page as NavItemLink}
            onNavigate={onNavigate}
          />
        )
      )}
    </Box>
  );
};