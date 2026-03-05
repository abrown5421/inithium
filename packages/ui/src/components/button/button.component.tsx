import React from 'react';
import { Button as HeadlessUIButton } from '@headlessui/react';
import { cn } from '@inithium/theme';
import { buttonVariants } from '../../utils/variants.js';
import type { IButtonProps } from './button.types.js';

export function Button(props: IButtonProps): React.JSX.Element {
  const {
    variant,
    size,
    isLoading,
    className,
    disabled,
    children,
    type = 'button',
    onClick,
  } = props;

  const classes = cn(buttonVariants({ variant, size }), className);

  return (
    <HeadlessUIButton
      type={type}
      className={classes}
      disabled={disabled || isLoading}
      onClick={onClick}
    >
      {isLoading && (
        <span className="mr-2 inline-flex h-4 w-4 animate-spin rounded-full border-2 border-border border-t-transparent" />
      )}
      {children}
    </HeadlessUIButton>
  );
}

