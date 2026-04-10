export interface AvatarOptions {
  gradient?: string;
  font?: string;
  variant?: 'square' | 'circular';
}

export interface AvatarProps {
  src?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  alt?: string;
  options?: AvatarOptions;
}