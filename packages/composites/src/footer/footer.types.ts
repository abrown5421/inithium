import type { NavLink } from '@inithium/shared';

export interface FooterProps {
  links?: NavLink[];
  secondaryLinks?: NavLink[];
  copyrightName?: string;
  copyrightYear?: number;
}