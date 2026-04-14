import type { ThemeColor, ComponentSize } from '@inithium/types';

export type DialogSize = 'sm' | 'base' | 'lg' | 'xl' | 'full';

export interface DialogProps {
  open: boolean;
  onClose: (value: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  color?: ThemeColor;
  size?: DialogSize;
  className?: string;
  panelClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  overlayClassName?: string;
}