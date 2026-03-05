import type { BaseComponentProps } from '../../types/component.types.js';

export interface IFieldsetProps extends BaseComponentProps {
  legend?: string;
  disabled?: boolean;
}

export interface IFieldProps extends BaseComponentProps {}

export interface ILabelProps extends BaseComponentProps {
  htmlFor?: string;
}

export interface IDescriptionProps extends BaseComponentProps {}

export interface IErrorMessageProps extends BaseComponentProps {}

