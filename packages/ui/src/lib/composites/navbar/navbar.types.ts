import { User } from "@inithium/types";

export type NavbarLogoProps = {
  imageSrc?: string;
  title?: string;
};

export type NavItemBase = {
  path: string;
  label: string;
  showInNav?: boolean;
};

export type NavItemLink = NavItemBase & {
  type?: 'link';
};

export type NavItemGroup = NavItemBase & {
  type: 'group';
  children: NavItemLink[];
};

export type NavItem = NavItemLink | NavItemGroup;

export type PageRegistryEntry = NavItem;

export type ProfileLink = {
  path: string;
  label: string;
};

export type NavbarProps = {
  logo?: NavbarLogoProps;
  pages: PageRegistryEntry[];
  isAuthenticated: boolean;
  user?: User | null; 
  onNavigate?: (path: string) => void;
  onLoginClick?: () => void;
  profileLinks?: ProfileLink[];
};

export interface UserSlotProps {
  isAuthenticated: boolean;
  user?: User | null;
  onAvatarClick: () => void;
  onHamburgerClick: () => void;
  onLoginClick: () => void;
}