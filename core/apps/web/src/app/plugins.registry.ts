import type { PageTemplate } from '@inithium/web-shell';

/**
 * Page templates from installed plugins and libs/client (decision 0078). Owned by the install/eject tooling:
 * core ships it empty and never adds entries. A template here replaces core's template with the same key.
 */
export const registeredTemplates: PageTemplate[] = [];
