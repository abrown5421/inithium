import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import type { DashboardWidget } from '@inithium/shared-contracts';
import { coreDashboardWidgets } from './core-dashboard-widgets.config';
import {
  addWidget,
  checkDashboardWidgets,
  DEFAULT_DASHBOARD,
  moveWidget,
  removeWidget,
  resizeWidget,
  shownWidgets,
  widgetSettings,
  widgetWidth,
} from './dashboard-layout.service';
import { defineDashboardWidget, type DashboardWidgetDefinition } from './dashboard-widget.types';

const widget = (id: string, type = 'member-growth'): DashboardWidget => ({ id, type, width: '1/3', settings: {} });
const ids = (widgets: DashboardWidget[]) => widgets.map((entry) => entry.id);
const everyone = () => true;

describe('the default dashboard (decision 0120)', () => {
  it('holds core’s widgets only, each with a known type and allowed settings', () => {
    for (const entry of DEFAULT_DASHBOARD) {
      const definition = coreDashboardWidgets.find((candidate) => candidate.type === entry.type);
      expect(definition, entry.type).toBeDefined();
      expect(definition?.settingsSchema.safeParse(entry.settings).success).toBe(true);
      expect(definition?.widths).toContain(entry.width);
    }
    expect(() => checkDashboardWidgets(coreDashboardWidgets)).not.toThrow();
  });
});

describe('shownWidgets', () => {
  it('leaves out unknown types and widgets the user may not see, in order', () => {
    const widgets = [widget('a'), widget('b', 'plugin-gone:thing'), widget('c', 'setup-checklist')];
    expect(shownWidgets(widgets, coreDashboardWidgets, everyone).map(({ widget: entry }) => entry.id)).toEqual(['a', 'c']);
    const noSettings = (definition: DashboardWidgetDefinition) => definition.permission !== 'settings.edit';
    expect(shownWidgets(widgets, coreDashboardWidgets, noSettings).map(({ widget: entry }) => entry.id)).toEqual(['a']);
  });
});

describe('moveWidget', () => {
  const widgets = [widget('1'), widget('2'), widget('3'), widget('4'), widget('5')];

  it('swaps with the widget before or after it, once per press', () => {
    const once = moveWidget(widgets, '5', -1, everyone);
    expect(ids(once)).toEqual(['1', '2', '3', '5', '4']);
    expect(ids(moveWidget(once, '5', -1, everyone))).toEqual(['1', '2', '5', '3', '4']);
    expect(ids(moveWidget(widgets, '1', 1, everyone))).toEqual(['2', '1', '3', '4', '5']);
  });

  it('stays put at either end', () => {
    expect(ids(moveWidget(widgets, '1', -1, everyone))).toEqual(ids(widgets));
    expect(ids(moveWidget(widgets, '5', 1, everyone))).toEqual(ids(widgets));
  });

  it('steps over widgets that aren’t drawn', () => {
    const hidden = (entry: DashboardWidget) => entry.id !== '4';
    expect(ids(moveWidget(widgets, '5', -1, hidden))).toEqual(['1', '2', '5', '4', '3']);
  });
});

describe('changing widgets', () => {
  it('resizes, removes and adds at the end with the definition’s defaults', () => {
    const widgets = [widget('a'), widget('b')];
    expect(resizeWidget(widgets, 'b', 'full')[1]?.width).toBe('full');
    expect(ids(removeWidget(widgets, 'a'))).toEqual(['b']);
    const [members] = coreDashboardWidgets;
    const added = addWidget(widgets, members as DashboardWidgetDefinition, 'new');
    expect(added.at(-1)).toEqual({ id: 'new', type: 'member-growth', width: '1/3', settings: { range: 'month' } });
  });

  it('never adds past the limit', () => {
    const full = Array.from({ length: 32 }, (_, index) => widget(`w${index}`));
    expect(addWidget(full, coreDashboardWidgets[0] as DashboardWidgetDefinition)).toHaveLength(32);
  });
});

describe('a widget’s stored values', () => {
  const definition = defineDashboardWidget({
    type: 'plugin-shop:orders',
    label: 'Orders',
    description: 'Recent orders.',
    icon: 'shopping-cart',
    widths: ['2/3', 'full'],
    defaultWidth: '2/3',
    settingsSchema: z.object({ count: z.number().int() }),
    defaultSettings: { count: 5 },
    component: () => null,
  });

  it('falls back to the defaults when settings don’t fit', () => {
    expect(widgetSettings({ ...widget('a'), settings: { count: 'many' } }, definition)).toEqual({ count: 5 });
    expect(widgetSettings({ ...widget('a'), settings: { count: 9 } }, definition)).toEqual({ count: 9 });
  });

  it('draws a width the widget doesn’t allow at its default', () => {
    expect(widgetWidth({ ...widget('a'), width: '1/4' }, definition)).toBe('2/3');
    expect(widgetWidth({ ...widget('a'), width: 'full' }, definition)).toBe('full');
    expect(widgetWidth({ ...widget('a'), width: '3/4' }, definition)).toBe('2/3');
  });

  it('refuses two widgets of one type, or a default width not allowed', () => {
    expect(() => checkDashboardWidgets([definition, definition])).toThrow(/plugin-shop:orders/);
    expect(() => checkDashboardWidgets([{ ...definition, defaultWidth: '1/4' }])).toThrow(/default width/);
  });
});
