import React from 'react';
import {
  Description as HeadlessUIDescription,
  Field as HeadlessUIField,
  Fieldset as HeadlessUIFieldset,
  Label as HeadlessUILabel,
} from '@headlessui/react';
import { cn } from '@inithium/theme';
import type {
  IDescriptionProps,
  IErrorMessageProps,
  IFieldProps,
  IFieldsetProps,
  ILabelProps,
} from './fieldset.types.js';

export function Fieldset(props: IFieldsetProps): React.JSX.Element {
  const { legend, disabled, className, children } = props;

  return (
    <HeadlessUIFieldset
      disabled={disabled}
      className={cn('space-y-4 disabled:opacity-50', className)}
    >
      {legend ? <legend className="field-label">{legend}</legend> : null}
      {children}
    </HeadlessUIFieldset>
  );
}

export function Field(props: IFieldProps): React.JSX.Element {
  const { className, children } = props;

  return <HeadlessUIField className={cn('field-wrapper', className)}>{children}</HeadlessUIField>;
}

export function Label(props: ILabelProps): React.JSX.Element {
  const { className, children, htmlFor } = props;

  return (
    <HeadlessUILabel htmlFor={htmlFor} className={cn('field-label', className)}>
      {children}
    </HeadlessUILabel>
  );
}

export function Description(props: IDescriptionProps): React.JSX.Element {
  const { className, children } = props;

  return (
    <HeadlessUIDescription className={cn('field-hint', className)}>
      {children}
    </HeadlessUIDescription>
  );
}

export function ErrorMessage(props: IErrorMessageProps): React.JSX.Element | null {
  const { className, children } = props;

  if (!children) {
    return null;
  }

  return <div className={cn('field-error', className)}>{children}</div>;
}

