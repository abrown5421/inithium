import type { ContentElementEditor } from '@inithium/cms-content-editor';
import type { DashboardWidgetDefinition } from '@inithium/cms-dashboard';
import type { ContentElementRenderer } from '@inithium/shared-content';
import type { ContentElementContract } from '@inithium/shared-contracts';

// What installed plugins and libs/client add to the CMS (decisions 0015, 0116). Owned by the install/eject tooling:
// core ships every list empty and never adds entries.

/** Content elements' contracts, from their `contracts` libs: the page builder checks drafts as the api does. */
export const registeredContentElementContracts: ContentElementContract[] = [];

/** How content elements draw, from their `shared` libs (decision 0118): the page builder's preview draws them. */
export const registeredContentElementRenderers: ContentElementRenderer[] = [];

/** Content elements in the page builder (Add picker, Layers, properties), from their `cms` libs. */
export const registeredContentElementEditors: ContentElementEditor[] = [];

/**
 * Widgets CMS users can add to their dashboards (decision 0120), from their `cms` libs through
 * `defineDashboardWidget()`. They appear only in the Add widget picker: never on anyone's dashboard by default.
 */
export const registeredDashboardWidgets: DashboardWidgetDefinition[] = [];
