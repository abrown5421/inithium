import type { BaseComponentProps } from '../../types/component.types.js';

export interface IDialogProps extends BaseComponentProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export interface IDialogPanelProps extends BaseComponentProps {}

export interface IDialogTitleProps extends BaseComponentProps {}

