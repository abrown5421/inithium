export type LoaderVariant =
  | 'spinner'
  | 'dots'
  | 'bars'
  | 'pulse'
  | 'ring'
  | 'wave'
  | 'bounce'
  | 'orbit'
  | 'ripple';

export interface LoaderProps {
  variant?: LoaderVariant;
  color?: string;
  size?: string | number;
  className?: string;
  'aria-label'?: string;
}