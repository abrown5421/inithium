import type { ReactNode } from 'react';
import type { Permission } from '@inithium/shared-contracts';
import type { IconName } from '@inithium/shared-ui-components';

/** A CMS screen: its route, its sidebar entry, and who may see it (decision 0086). */
export type CmsScreen = {
  /** Its route under the CMS, e.g. '/pages'. '/' is the dashboard. */
  path: string;
  label: string;
  icon: IconName;
  element: ReactNode;
  /** Shown only to users with this permission. */
  permission?: Permission;
};
