import { cn } from '@inithium/theme';
import type { InputVariant, Size, Variant } from '../types/component.types';

export function buttonVariants({
  variant = 'primary',
  size = 'md',
}: {
  variant?: Variant;
  size?: Size;
}): string {
  return cn('btn', `btn-${size}`, `btn-${variant}`);
}

export function inputVariants({
  variant = 'default',
  size = 'md',
}: {
  variant?: InputVariant;
  size?: Size;
}): string {
  const classes = ['input-base', `input-${size}`];

  if (variant !== 'default') {
    classes.push(`input-${variant}`);
  }

  return cn(...classes);
}

