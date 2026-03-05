import type { BaseComponentProps } from '../../types/component.types.js';

export interface ITabsProps extends BaseComponentProps {
  defaultIndex?: number;
  onChange?: (index: number) => void;
}

export interface ITabProps extends BaseComponentProps {
  disabled?: boolean;
}

export interface ITabPanelProps extends BaseComponentProps {}

export interface ITabListProps extends BaseComponentProps {}

