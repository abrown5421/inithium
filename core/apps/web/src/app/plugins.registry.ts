import type { ProfileSlots } from '@inithium/web-pages';
import type { PageTemplate } from '@inithium/web-shell';

/**
 * Page templates from installed plugins and libs/client (decision 0078). Owned by the install/eject tooling:
 * core ships it empty and never adds entries. A template here replaces core's template with the same key.
 */
export const registeredTemplates: PageTemplate[] = [];

/**
 * Profile tabs, sidebar sections and header actions from installed plugins and libs/client (decisions 0081, 0090).
 * Owned by the install/eject tooling: core ships them empty and never adds entries.
 */
export const registeredProfileSlots: ProfileSlots = { tabs: [], sidebarSections: [], headerActions: [] };
