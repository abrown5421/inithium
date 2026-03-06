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