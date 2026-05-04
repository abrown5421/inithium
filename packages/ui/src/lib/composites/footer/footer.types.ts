import { PageRegistryEntry } from "../navbar/navbar.types";

export type FooterLink = {
  path: string;
  label: string;
};

export type FooterProps = {
  pages: PageRegistryEntry[];
  onNavigate?: (path: string) => void;
  copyright?: string;
};