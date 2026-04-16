import React, { AriaAttributes } from 'react';
import * as Solid16 from '@heroicons/react/16/solid';
import * as Solid20 from '@heroicons/react/20/solid';
import * as Solid24 from '@heroicons/react/24/solid';
import * as Outline24 from '@heroicons/react/24/outline';
import { cn, TEXT_COLOR_MAP } from '@inithium/utils';
import type { ThemeColor } from '@inithium/types';
import type { IconSize, IconStyle, IconProps } from './icon.types';

const SIZE_LOOKUP: Record<IconSize, string> = {
  xs: 'size-3',
  sm: 'size-4',
  base: 'size-5',
  lg: 'size-6',
  xl: 'size-8',
  '2xl': 'size-10',
};

const ICON_LIBRARY_MAP: Record<IconStyle, Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>>> = {
  'solid-16': Solid16 as Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>>,
  'solid-20': Solid20 as Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>>,
  'solid-24': Solid24 as Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>>,
  'outline-24': Outline24 as Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>>,
};

const resolveIcon = (style: IconStyle, name: string) => 
  ICON_LIBRARY_MAP[style]?.[name] ?? null;

const getAccessibilityProps = (
  label?: string, 
  hidden?: AriaAttributes['aria-hidden']
) => ({
  'aria-label': label,
  'aria-hidden': hidden ?? (!label ? true : undefined),
});

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
  const HeroIcon = resolveIcon(iconStyle, name as string);

  if (!HeroIcon) return null;

  return (
    <HeroIcon
      className={cn(
        SIZE_LOOKUP[size],
        color ? TEXT_COLOR_MAP[color as ThemeColor]?.text : '',
        className
      )}
      style={style}
      {...getAccessibilityProps(ariaLabel, ariaHidden)}
    />
  );
};