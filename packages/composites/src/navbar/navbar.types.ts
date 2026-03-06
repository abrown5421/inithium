export interface NavLink {
  label: string;
  href?: string;
  dropdown?: DropdownItem[];
}

export interface DropdownItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface NavbarUser {
  name: string;
  avatarUrl?: string;
}

export interface NavbarProps {
  logoSrc?: string;
  logoText?: string;
  links: NavLink[];
  user?: NavbarUser;
  onLogout?: () => void;
}

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  links: NavbarProps['links'];
  user?: NavbarProps['user'];
  onLogout?: () => void;
}

export interface AvatarButtonProps {
  user: NonNullable<NavbarProps['user']>;
  onClick: () => void;
}
