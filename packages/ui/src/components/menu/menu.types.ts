import type { BaseComponentProps } from '../../types/component.types.js';

export interface IMenuProps extends BaseComponentProps {}

export interface IMenuButtonProps extends BaseComponentProps {}

export interface IMenuItemsProps extends BaseComponentProps {}

export interface IMenuItemProps extends BaseComponentProps {
  disabled?: boolean;
  onClick?: () => void;
}

