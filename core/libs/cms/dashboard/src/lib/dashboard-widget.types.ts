import type { ComponentType } from 'react';
import type { z } from 'zod';
import type { DashboardWidgetWidth, Permission } from '@inithium/shared-contracts';
import type { IconName } from '@inithium/shared-ui-components';

/** What a dashboard widget's component gets. */
export type DashboardWidgetProps<S = Record<string, unknown>> = {
  /** Its saved settings, checked against its `settingsSchema` (its `defaultSettings` if they don't fit). */
  settings: S;
  /** Saves new settings, e.g. when its range changes. The dashboard updates at once. */
  onSettingsChange: (settings: S) => void;
  /** How wide it is on the user's dashboard. */
  width: DashboardWidgetWidth;
};

/**
 * The dashboard widgets slot (decisions 0015, 0120): a widget a CMS user can add to their dashboard. Register a
 * plugin's (or `libs/client/`'s) in the CMS's registry (`apps/cms/src/app/plugins.registry.ts`) through
 * `defineDashboardWidget()`. It only ever appears in the Add widget picker: users add it themselves.
 */
export type DashboardWidgetDefinition<S = Record<string, unknown>> = {
  /** Unique: core's are plain names (e.g. 'member-growth'), a plugin's `plugin-<name>:<widget>`. */
  type: string;
  /** Its title, in its header and the picker, e.g. 'Members'. */
  label: string;
  /** A line in the picker saying what it shows. */
  description: string;
  icon: IconName;
  /** Who may add and see it. Its data endpoints must check the same permission. */
  permission?: Permission;
  /** The widths it may take, narrowest first; at least one. */
  widths: readonly DashboardWidgetWidth[];
  /** Its width when added; one of `widths`. */
  defaultWidth: DashboardWidgetWidth;
  /** Checks its stored settings. */
  settingsSchema: z.ZodType<S>;
  /** Its settings when added. */
  defaultSettings: S;
  /**
   * Draws it, under the header the dashboard gives it (title, ← →, menu). It fetches its own data; it may be
   * `React.lazy`, and a failure shows inside it without breaking the dashboard.
   */
  component: ComponentType<DashboardWidgetProps<S>>;
};

/** Types a widget's definition by its settings, for listing with others. */
export function defineDashboardWidget<S>(definition: DashboardWidgetDefinition<S>): DashboardWidgetDefinition {
  return definition as unknown as DashboardWidgetDefinition;
}
