import type { BaseComponentProps } from '../../types/component.types.js';

export interface IDisclosureProps extends BaseComponentProps {
  defaultOpen?: boolean;
}

export interface IDisclosurePanelProps extends BaseComponentProps {}

export interface IDisclosureButtonProps extends BaseComponentProps {
  onClick?: () => void;
}

