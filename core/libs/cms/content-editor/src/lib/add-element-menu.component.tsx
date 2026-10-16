import type { ReactElement } from 'react';
import type { ContentElementType, PluginElementType } from '@inithium/shared-contracts';
import type { IconName } from '@inithium/shared-ui-components';
import { Menu, type MenuItem } from '@inithium/shared-ui-composites';
import { addPickerGroups } from './content-tree.service';

export type AddElementMenuProps = {
  /** Says where the element goes, e.g. 'Inside “Card”'. */
  where: string;
  onAdd: (type: ContentElementType | PluginElementType) => void;
  /** The button that opens it. */
  children: ReactElement;
  align?: 'start' | 'center' | 'end';
};

/**
 * The page builder's Add picker (decision 0116): where the new element goes, then every element in groups, each
 * with a line about it, registered plugins' elements included.
 */
export function AddElementMenu({ where, onAdd, children, align = 'start' }: AddElementMenuProps) {
  const items: MenuItem[] = [{ heading: where }];
  for (const group of addPickerGroups()) {
    items.push('separator', { heading: group.label });
    for (const item of group.items) {
      items.push({ label: item.label, description: item.description, icon: item.icon as IconName, onSelect: () => onAdd(item.type) });
    }
  }
  return (
    <Menu items={items} aria-label="Elements to add" align={align}>
      {children}
    </Menu>
  );
}
