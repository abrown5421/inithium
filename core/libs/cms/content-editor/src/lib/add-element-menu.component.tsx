import type { ReactElement } from 'react';
import type { ContentElementType } from '@inithium/shared-contracts';
import type { IconName } from '@inithium/shared-ui-components';
import { Menu, type MenuItem } from '@inithium/shared-ui-composites';
import { ELEMENT_GROUPS, ELEMENT_TYPES } from './content-tree.service';

export type AddElementMenuProps = {
  /** Says where the element goes, e.g. 'Inside “Card”'. */
  where: string;
  onAdd: (type: ContentElementType) => void;
  /** The button that opens it. */
  children: ReactElement;
  align?: 'start' | 'center' | 'end';
};

/**
 * The page builder's Add picker (decision 0116): where the new element goes, then every element in groups, each
 * with a line about it.
 */
export function AddElementMenu({ where, onAdd, children, align = 'start' }: AddElementMenuProps) {
  const items: MenuItem[] = [{ heading: where }];
  for (const group of ELEMENT_GROUPS) {
    items.push('separator', { heading: group.label });
    for (const type of group.types) {
      items.push({ label: ELEMENT_TYPES[type].label, description: ELEMENT_TYPES[type].description, icon: ELEMENT_TYPES[type].icon as IconName, onSelect: () => onAdd(type) });
    }
  }
  return (
    <Menu items={items} aria-label="Elements to add" align={align}>
      {children}
    </Menu>
  );
}
