import { TrianglifyOptions } from "./banner.types.js";

export interface AvatarOptions {
  gradient?: string;
  font?: string;
  variant?: 'square' | 'circular';
}

export interface AvatarrProps {
  src?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  alt?: string;
  options?: TrianglifyOptions;
}