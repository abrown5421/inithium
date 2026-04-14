import React from 'react';
import * as Solid16 from '@heroicons/react/16/solid';
import * as Solid20 from '@heroicons/react/20/solid';
import * as Solid24 from '@heroicons/react/24/solid';
import * as Outline24 from '@heroicons/react/24/outline';
import { cn, TEXT_COLOR_MAP } from '@inithium/utils';
import type { ThemeColor } from '@inithium/types';
import type { IconName, IconSize, IconStyle, IconProps } from './icon.types';

const SIZE_LOOKUP: Record<IconSize, string> = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  base: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
  '2xl': 'w-10 h-10',
};

const ICON_LIBRARY_MAP: Record<IconStyle, Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>>> = {
  'solid-16': Solid16 as Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>>,
  'solid-20': Solid20 as Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>>,
  'solid-24': Solid24 as Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>>,
  'outline-24': Outline24 as Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>>,
};

export const Icon: React.FC<IconProps> = ({
  name,
  iconStyle = 'solid-24',
  size = 'base',
  color,
  className = '',
  style,
  'aria-label': ariaLabel,
  'aria-hidden': ariaHidden,
}) => {
  const library = ICON_LIBRARY_MAP[iconStyle];
  const HeroIcon = library[name as string];

  if (!HeroIcon) return null;

  const colorClass = color ? TEXT_COLOR_MAP[color as ThemeColor]?.text : '';

  return (
    <HeroIcon
      className={cn(
        SIZE_LOOKUP[size],
        colorClass,
        className
      )}
      style={style}
      aria-label={ariaLabel}
      aria-hidden={ariaHidden ?? (!ariaLabel ? true : undefined)}
    />
  );
};