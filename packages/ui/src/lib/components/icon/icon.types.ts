import type * as HeroIconsSolid16 from '@heroicons/react/16/solid';
import type { ThemeColor } from '@inithium/types';

export type IconStyle = 'solid-16' | 'solid-20' | 'solid-24' | 'outline-24';

export type IconSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';

export type IconName = keyof typeof HeroIconsSolid16;

export interface IconProps {
  name: IconName;
  iconStyle?: IconStyle;
  size?: IconSize;
  color?: ThemeColor;
  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
  'aria-hidden'?: boolean | 'true' | 'false';
}