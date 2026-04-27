import React from "react";
import { PageRegistryEntry, NavItemGroup, NavItemLink } from "./navbar.types";
import { Dropdown } from "../../components/dropdown";
import { Icon } from "../../components/icon";
import { usePageTransition } from "@inithium/store";

interface NavSlotProps {
  pages: PageRegistryEntry[];
  onNavigate?: (path: string) => void;
  className?: string;
}

const isGroup = (item: PageRegistryEntry): item is NavItemGroup =>
  (item as any).type === "group";

const NavLink: React.FC<{ page: NavItemLink; onNavigate?: (path: string) => void }> = ({
  page,
  onNavigate,
}) => {
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
      className="px-3 py-1.5 rounded-md text-sm font-medium text-on-surface hover:bg-surface3 transition-colors duration-150"
    >
      {page.label}
    </a>
  );
};

const NavGroup: React.FC<{ page: NavItemGroup; onNavigate?: (path: string) => void }> = ({
  page,
  onNavigate,
}) => {
  const { controller } = usePageTransition();

  const items = page.children
    .filter((c: any) => c.showInNav !== false)
    .map((c: any) => ({ label: c.label, value: c.path }));

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
      anchor="bottom start"
      items={items}
      onSelect={handleSelect}
      trigger={
        <>
          <span className="text-sm font-medium">{page.label}</span>
          <Icon name="ChevronDownIcon" iconStyle="solid-16" size="xs" aria-hidden />
        </>
      }
      triggerClassName="gap-1"
    />
  );
};

export const NavSlot: React.FC<NavSlotProps> = ({ pages, onNavigate, className }) => {
  const visible = pages.filter((p) => (p as any).showInNav !== false);

  if (visible.length === 0) return null;

  return (
    <nav
      className={`hidden lg:flex items-center gap-1 ${className ?? ""}`}
      aria-label="Main navigation"
    >
      {visible.map((page) =>
        isGroup(page) ? (
          <NavGroup key={page.path} page={page} onNavigate={onNavigate} />
        ) : (
          <NavLink key={page.path} page={page as NavItemLink} onNavigate={onNavigate} />
        )
      )}
    </nav>
  );
};