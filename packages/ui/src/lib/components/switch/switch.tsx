import React from 'react';
import { Switch as HeadlessSwitch } from '@headlessui/react';
import { cn } from '@inithium/utils';
import type { ThemeColor, ComponentSize } from '@inithium/types';
import type { SwitchProps } from './switch.types';

const CHECKED_COLOR_MAP: Record<ThemeColor, string> = {
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  accent: 'bg-accent',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
  surface: 'bg-surface',
  surface2: 'bg-surface2',
  surface3: 'bg-surface3',
  surface4: 'bg-surface4',
};

const TRACK_SIZE_MAP: Record<ComponentSize, string> = {
  sm: 'h-4 w-7',
  base: 'h-5 w-9',
  lg: 'h-6 w-11',
  xl: 'h-7 w-13',
};

const THUMB_SIZE_MAP: Record<ComponentSize, string> = {
  sm: 'size-3',
  base: 'size-4',
  lg: 'size-5',
  xl: 'size-6',
};

const THUMB_TRANSLATE_MAP: Record<ComponentSize, string> = {
  sm: 'translate-x-3',
  base: 'translate-x-4',
  lg: 'translate-x-5',
  xl: 'translate-x-6',
};

const LABEL_SIZE_MAP: Record<ComponentSize, string> = {
  sm: 'text-xs',
  base: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg',
};

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  description,
  color = 'primary',
  size = 'base',
  disabled = false,
  className = '',
  switchClassName = '',
  labelClassName = '',
  descriptionClassName = '',
  name,
  value,
  labelPosition = 'right',
}) => {
  const computeTrackClasses = (active: boolean) => cn(
    'relative inline-flex flex-shrink-0 items-center rounded-full border-2 border-transparent',
    'transition-colors duration-200 ease-in-out cursor-pointer',
    'focus:outline-none data-[focus]:ring-2 data-[focus]:ring-offset-2',
    active ? CHECKED_COLOR_MAP[color] : 'bg-gray-300',
    TRACK_SIZE_MAP[size],
    switchClassName,
  );

  const computeThumbClasses = (active: boolean) => cn(
    'pointer-events-none inline-block rounded-full bg-white shadow-lg',
    'transform transition duration-200 ease-in-out',
    THUMB_SIZE_MAP[size],
    active ? THUMB_TRANSLATE_MAP[size] : 'translate-x-0',
  );

  const LabelContent = () => (
    <span className="flex flex-col gap-0.5">
      {label && (
        <span className={cn('font-medium text-on-surface', LABEL_SIZE_MAP[size], labelClassName)}>
          {label}
        </span>
      )}
      {description && (
        <span className={cn('text-xs text-on-surface/60', descriptionClassName)}>
          {description}
        </span>
      )}
    </span>
  );

  const track = (
    <HeadlessSwitch
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      name={name}
      value={value}
      className={({ checked: active }) => computeTrackClasses(active)}
    >
      {({ checked: active }) => (
        <span
          aria-hidden="true"
          className={computeThumbClasses(active)}
        />
      )}
    </HeadlessSwitch>
  );

  return (
    <label className={cn('flex items-start gap-3 cursor-pointer', disabled && 'opacity-50 cursor-not-allowed', className)}>
      {labelPosition === 'left' && (label || description) && <LabelContent />}
      <span className="mt-0.5">{track}</span>
      {labelPosition === 'right' && (label || description) && <LabelContent />}
    </label>
  );
};