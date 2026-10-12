import type { ReactNode } from 'react';
import type { Permission } from '@inithium/shared-contracts';
import type { IconName } from '@inithium/shared-ui-components';

/** A CMS screen: its route, its sidebar entry, and who may see it (decisions 0086, 0094). */
export type CmsScreen = {
  /** Its route under the CMS, e.g. '/pages' or '/pages/:id/content'. '/' is the dashboard. */
  path: string;
  label: string;
  icon: IconName;
  element: ReactNode;
  /** Shown only to users with this permission. */
  permission?: Permission;
  /** Whether it has a sidebar entry. Default true; screens reached from another (e.g. an editor) set false. */
  inSidebar?: boolean;
  /** Fills the space under the top bar with no sidebar or padding (SidebarLayout's `fill`), e.g. an editor. */
  fill?: boolean;
};
