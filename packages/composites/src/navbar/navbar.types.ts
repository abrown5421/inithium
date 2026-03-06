import type { NavLink } from '@inithium/shared';

export interface NavbarUser {
  name: string;
  avatarUrl?: string;
}

export interface NavbarProps {
  logoSrc?: string;
  logoText?: string;
  links: NavLink[];
  secondaryLinks?: NavLink[];
  user?: NavbarUser;
  onLogout?: () => void;
}

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  links: NavbarProps['links'];
  secondaryLinks: NavbarProps['secondaryLinks'];
  user?: NavbarProps['user'];
  onLogout?: () => void;
}

export interface AvatarButtonProps {
  user: NonNullable<NavbarProps['user']>;
  onClick: () => void;
}
