import React from 'react';
import {
  RadioGroup as HeadlessRadioGroup,
  Radio,
  Label,
  Description,
} from '@headlessui/react';
import { cn } from '../lib/cn.js';

export interface RadioOption<T extends string = string> {
  value: T;
  label: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps<T extends string = string> {
  value: T;
  onChange: (value: T) => void;
  options: RadioOption<T>[];
  legend?: string;
  orientation?: 'vertical' | 'horizontal';
  variant?: 'default' | 'card';
  className?: string;
}

export function RadioGroup<T extends string = string>({
  value,
  onChange,
  options,
  legend,
  orientation = 'vertical',
  variant = 'default',
  className,
}: RadioGroupProps<T>) {
  return (
    <HeadlessRadioGroup value={value} onChange={onChange} className={cn('w-full', className)}>
      {legend && (
        <Label className="block text-sm font-semibold text-(--ui-text) mb-2">{legend}</Label>
      )}
      <div
        className={cn(
          'flex',
          orientation === 'vertical' ? 'flex-col gap-2' : 'flex-row flex-wrap gap-3',
        )}
      >
        {options.map((option) => (
          <Radio
            key={String(option.value)}
            value={option.value}
            disabled={option.disabled}
            className={cn(
              variant === 'card' && [
                'relative flex cursor-pointer rounded-(--radius-lg) border p-4',
                'transition-all duration-150 focus-visible:outline-none',
                'data-[checked]:border-(--color-brand-500) data-[checked]:bg-(--color-brand-50)',
                'dark:data-[checked]:bg-(--color-brand-900)/20',
                'data-[focus]:ring-2 data-[focus]:ring-(--color-brand-500) data-[focus]:ring-offset-1',
                'hover:bg-(--ui-bg-subtle) border-(--ui-border)',
                option.disabled && 'opacity-50 cursor-not-allowed',
              ],
              variant === 'default' && [
                'flex items-start gap-2.5 cursor-pointer',
                option.disabled && 'opacity-50 cursor-not-allowed',
              ],
            )}
          >
            {({ checked }) => (
              <>
                {variant === 'default' && (
                  <span
                    className={cn(
                      'mt-0.5 size-4 shrink-0 rounded-full border-2',
                      'inline-flex items-center justify-center',
                      'transition-all duration-150',
                      checked
                        ? 'border-(--color-brand-600)'
                        : 'border-(--ui-border) hover:border-(--color-brand-400)',
                    )}
                  >
                    {checked && (
                      <span className="size-2 rounded-full bg-(--color-brand-600)" />
                    )}
                  </span>
                )}
                <div className="flex flex-col flex-1">
                  <Label className="text-sm font-medium text-(--ui-text) cursor-pointer">
                    {option.label}
                  </Label>
                  {option.description && (
                    <Description className="text-xs text-(--ui-text-muted) mt-0.5">
                      {option.description}
                    </Description>
                  )}
                </div>
                {variant === 'card' && (
                  <span
                    className={cn(
                      'ml-auto size-4 shrink-0 rounded-full border-2',
                      'inline-flex items-center justify-center',
                      'transition-all duration-150',
                      checked
                        ? 'border-(--color-brand-600)'
                        : 'border-(--ui-border)',
                    )}
                  >
                    {checked && (
                      <span className="size-2 rounded-full bg-(--color-brand-600)" />
                    )}
                  </span>
                )}
              </>
            )}
          </Radio>
        ))}
      </div>
    </HeadlessRadioGroup>
  );
}
