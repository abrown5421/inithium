import type { DashboardWidget, DashboardWidgetWidth } from '@inithium/shared-contracts';
import { MAX_DASHBOARD_WIDGETS } from '@inithium/shared-contracts';
import type { DashboardWidgetDefinition } from './dashboard-widget.types';

/** The default dashboard's widgets (decision 0120): core's own, never a plugin's. Together they fill the first row. */
export const DEFAULT_DASHBOARD: readonly DashboardWidget[] = [
  { id: 'setup-checklist', type: 'setup-checklist', width: '1/3', settings: {} },
  { id: 'members', type: 'member-growth', width: '2/3', settings: { range: 'month' } },
];

/** A new widget's id: random, so the same widget can be added twice. */
export function newWidgetId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `w-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** A widget as the dashboard draws it: its stored entry and its definition. */
export type ShownWidget = { widget: DashboardWidget; definition: DashboardWidgetDefinition };

/**
 * The widgets to draw: those whose type is known and that the user may see. The rest (a removed plugin's, or one the
 * user lost the permission for) stay stored but aren't drawn.
 */
export function shownWidgets(
  widgets: readonly DashboardWidget[],
  definitions: readonly DashboardWidgetDefinition[],
  allowed: (definition: DashboardWidgetDefinition) => boolean,
): ShownWidget[] {
  return widgets.flatMap((widget) => {
    const definition = definitions.find((candidate) => candidate.type === widget.type);
    return definition && allowed(definition) ? [{ widget, definition }] : [];
  });
}

/**
 * Swaps a widget with the shown widget before it (-1) or after it (1). Widgets that aren't drawn are stepped over, so
 * every press visibly moves it. Unchanged at either end.
 */
export function moveWidget(widgets: readonly DashboardWidget[], id: string, direction: -1 | 1, isShown: (widget: DashboardWidget) => boolean): DashboardWidget[] {
  const next = [...widgets];
  const from = next.findIndex((widget) => widget.id === id);
  if (from < 0) return next;
  let to = from + direction;
  while (to >= 0 && to < next.length && !isShown(next[to] as DashboardWidget)) to += direction;
  if (to < 0 || to >= next.length) return next;
  [next[from], next[to]] = [next[to] as DashboardWidget, next[from] as DashboardWidget];
  return next;
}

export function resizeWidget(widgets: readonly DashboardWidget[], id: string, width: DashboardWidgetWidth): DashboardWidget[] {
  return widgets.map((widget) => (widget.id === id ? { ...widget, width } : widget));
}

export function removeWidget(widgets: readonly DashboardWidget[], id: string): DashboardWidget[] {
  return widgets.filter((widget) => widget.id !== id);
}

export function updateWidgetSettings(widgets: readonly DashboardWidget[], id: string, settings: Record<string, unknown>): DashboardWidget[] {
  return widgets.map((widget) => (widget.id === id ? { ...widget, settings } : widget));
}

/** Adds a widget at the end, at its default width and settings; unchanged once the dashboard is full. */
export function addWidget(widgets: readonly DashboardWidget[], definition: DashboardWidgetDefinition, id = newWidgetId()): DashboardWidget[] {
  if (widgets.length >= MAX_DASHBOARD_WIDGETS) return [...widgets];
  return [...widgets, { id, type: definition.type, width: definition.defaultWidth, settings: definition.defaultSettings }];
}

/** The widget's settings if they fit its schema, otherwise its defaults. */
export function widgetSettings(widget: DashboardWidget, definition: DashboardWidgetDefinition): Record<string, unknown> {
  const parsed = definition.settingsSchema.safeParse(widget.settings);
  return parsed.success ? parsed.data : definition.defaultSettings;
}

/** The width to draw a widget at: its own if its definition allows it, otherwise the definition's default. */
export function widgetWidth(widget: DashboardWidget, definition: DashboardWidgetDefinition): DashboardWidgetWidth {
  return definition.widths.includes(widget.width) ? widget.width : definition.defaultWidth;
}

/** Throws if two definitions share a type, so a registry mistake shows at once. */
export function checkDashboardWidgets(definitions: readonly DashboardWidgetDefinition[]): void {
  const types = new Set<string>();
  for (const definition of definitions) {
    if (types.has(definition.type)) throw new Error(`Two dashboard widgets have the type '${definition.type}'`);
    if (!/^[a-z0-9-]+(:[a-z0-9-]+)?$/.test(definition.type)) throw new Error(`Dashboard widget type '${definition.type}' isn't kebab-case`);
    if (definition.widths.length === 0 || !definition.widths.includes(definition.defaultWidth)) {
      throw new Error(`Dashboard widget '${definition.type}' must allow its default width`);
    }
    types.add(definition.type);
  }
}
