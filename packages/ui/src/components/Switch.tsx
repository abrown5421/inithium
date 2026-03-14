import React from 'react';
import { Switch as HeadlessSwitch } from '@headlessui/react';
import { cn } from '../lib/cn.js';

type SwitchSize = 'sm' | 'md' | 'lg';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
  size?: SwitchSize;
  className?: string;
}

const trackSize: Record<SwitchSize, string> = {
  sm: 'h-4 w-7',
  md: 'h-5 w-9',
  lg: 'h-6 w-11',
};

const thumbSize: Record<SwitchSize, string> = {
  sm: 'size-3',
  md: 'size-3.5',
  lg: 'size-4',
};

const thumbTranslate: Record<SwitchSize, string> = {
  sm: 'translate-x-3.5',
  md: 'translate-x-4',
  lg: 'translate-x-5',
};

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  size = 'md',
  className,
}) => {
  const toggle = (
    <HeadlessSwitch
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      className={cn(
        'relative inline-flex shrink-0 items-center rounded-full',
        'transition-colors duration-200 ease-in-out',
        'focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-(--color-brand-500) focus-visible:ring-offset-2',
        'cursor-pointer disabled:cursor-not-allowed disabled:opacity-50',
        checked
          ? 'bg-(--color-brand-600)'
          : 'bg-(--color-surface-300) dark:bg-(--color-surface-600)',
        trackSize[size],
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none inline-block rounded-full bg-white shadow',
          'ring-0 transition-transform duration-200 ease-in-out',
          thumbSize[size],
          'translate-x-0.5',
          checked && thumbTranslate[size],
        )}
      />
    </HeadlessSwitch>
  );

  if (!label) return toggle;

  return (
    <label
      className={cn(
        'flex items-start gap-3',
        disabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
    >
      <div className="mt-0.5">{toggle}</div>
      <div className="flex flex-col">
        <span className="text-sm font-medium text-(--ui-text)">{label}</span>
        {description && (
          <span className="text-xs text-(--ui-text-muted) mt-0.5">{description}</span>
        )}
      </div>
    </label>
  );
};
