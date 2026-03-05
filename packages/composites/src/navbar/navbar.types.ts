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
  links: NavLink[];
  user?: NavbarUser;
  onLogout?: () => void;
}